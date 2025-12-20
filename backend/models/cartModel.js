const db = require("../db");

const CartModel = {
  // Tìm hoặc tạo giỏ hàng cho user
  findOrCreateCart: async (userId) => {
    let [rows] = await db.query(
      "SELECT * FROM GIO_HANG WHERE ma_nguoi_dung = ?",
      [userId]
    );
    if (rows.length === 0) {
      const [res] = await db.query(
        "INSERT INTO GIO_HANG (ma_nguoi_dung) VALUES (?)",
        [userId]
      );
      return res.insertId;
    }
    return rows[0].ma_gio_hang;
  },

  // Lấy chi tiết giỏ hàng (kèm thông tin sản phẩm)
  getCartDetails: async (cartId) => {
    const sql = `
      SELECT CT.*, SP.ten_san_pham, SP.gia, HA.duong_dan_anh, KHO.so_luong as ton_kho
      FROM CHI_TIET_GIO_HANG CT
      JOIN SAN_PHAM SP ON CT.ma_san_pham = SP.ma_san_pham
      LEFT JOIN HINH_ANH_SAN_PHAM HA ON SP.ma_san_pham = HA.ma_san_pham AND HA.anh_chinh = 1
      LEFT JOIN KHO ON SP.ma_san_pham = KHO.ma_san_pham
      WHERE CT.ma_gio_hang = ?
    `;
    const [rows] = await db.query(sql, [cartId]);
    return rows;
  },

  // Thêm sản phẩm vào giỏ
  addItem: async (cartId, productId, quantity) => {
    // 1. Kiểm tra sản phẩm đã có trong giỏ chưa
    const [exists] = await db.query(
      "SELECT * FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ? AND ma_san_pham = ?",
      [cartId, productId]
    );

    if (exists.length > 0) {
      // Nếu có rồi -> Tăng số lượng
      const newQty = exists[0].so_luong + quantity;
      await db.query(
        "UPDATE CHI_TIET_GIO_HANG SET so_luong = ? WHERE ma_chi_tiet = ?",
        [newQty, exists[0].ma_chi_tiet]
      );
    } else {
      // Chưa có -> Thêm mới
      await db.query(
        "INSERT INTO CHI_TIET_GIO_HANG (ma_gio_hang, ma_san_pham, so_luong) VALUES (?, ?, ?)",
        [cartId, productId, quantity]
      );
    }
  },

  // Cập nhật số lượng
  updateItemQty: async (cartId, productId, quantity) => {
    if (quantity <= 0) {
      // Nếu số lượng <= 0 thì xóa luôn
      return await db.query(
        "DELETE FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ? AND ma_san_pham = ?",
        [cartId, productId]
      );
    }
    await db.query(
      "UPDATE CHI_TIET_GIO_HANG SET so_luong = ? WHERE ma_gio_hang = ? AND ma_san_pham = ?",
      [quantity, cartId, productId]
    );
  },

  // Xóa sản phẩm khỏi giỏ
  removeItem: async (cartId, productId) => {
    await db.query(
      "DELETE FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ? AND ma_san_pham = ?",
      [cartId, productId]
    );
  },

  // 1. Tạo đơn hàng (Nhận conn từ controller để dùng Transaction)
  createOrder: async (userId, orderData, conn) => {
    const {
      finalTotal,
      discountAmount,
      appliedCoupon,
      address,
      phone,
      note,
      method,
    } = orderData;

    // Sử dụng conn truyền vào (để rollback nếu lỗi), nếu không có thì dùng db mặc định
    const connection = conn || db;

    const [res] = await connection.query(
      `INSERT INTO DON_HANG 
      (ma_nguoi_dung, tong_tien, tien_giam_gia, ma_khuyen_mai_da_dung, dia_chi_giao, so_dien_thoai, ghi_chu, trang_thai, phuong_thuc_thanh_toan)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        userId,
        finalTotal,
        discountAmount,
        appliedCoupon,
        address,
        phone,
        note,
        method,
      ]
    );
    return res.insertId;
  },

  // 2. Thêm chi tiết đơn hàng (Bulk Insert)
  addOrderDetails: async (orderId, items, conn) => {
    const connection = conn || db;
    // Chuyển mảng object thành mảng lồng nhau cho SQL
    const orderItems = items.map((item) => [
      orderId,
      item.ma_san_pham,
      item.so_luong,
      item.gia,
    ]);

    await connection.query(
      `INSERT INTO CHI_TIET_DON_HANG (ma_don_hang, ma_san_pham, so_luong, don_gia) VALUES ?`,
      [orderItems]
    );
  },

  // 3. Trừ tồn kho
  updateProductStock: async (items, conn) => {
    const connection = conn || db;
    for (const item of items) {
      await connection.query(
        "UPDATE KHO SET so_luong = so_luong - ? WHERE ma_san_pham = ?",
        [item.so_luong, item.ma_san_pham]
      );
    }
  },

  // Xóa toàn bộ giỏ (sau khi checkout)
  clearCart: async (cartId) => {
    await db.query("DELETE FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ?", [
      cartId,
    ]);
  },
};

module.exports = CartModel;
