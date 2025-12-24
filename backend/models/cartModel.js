// backend/models/cartModel.js
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
  // Lấy chi tiết giỏ hàng
  getCartDetails: async (cartId) => {
    const sql = `
      SELECT CT.*, SP.ten_san_pham, SP.gia, HA.duong_dan_anh
      FROM CHI_TIET_GIO_HANG CT
      JOIN SAN_PHAM SP ON CT.ma_san_pham = SP.ma_san_pham
      LEFT JOIN HINH_ANH_SAN_PHAM HA ON SP.ma_san_pham = HA.ma_san_pham AND HA.anh_chinh = 1
      WHERE CT.ma_gio_hang = ?
    `;
    const [rows] = await db.query(sql, [cartId]);
    return rows;
  },

  // Thêm sản phẩm vào giỏ
  addItem: async (cartId, productId, quantity) => {
    const [exists] = await db.query(
      "SELECT * FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ? AND ma_san_pham = ?",
      [cartId, productId]
    );

    if (exists.length > 0) {
      const newQty = exists[0].so_luong + quantity;
      await db.query(
        "UPDATE CHI_TIET_GIO_HANG SET so_luong = ? WHERE ma_chi_tiet = ?",
        [newQty, exists[0].ma_chi_tiet]
      );
    } else {
      await db.query(
        "INSERT INTO CHI_TIET_GIO_HANG (ma_gio_hang, ma_san_pham, so_luong) VALUES (?, ?, ?)",
        [cartId, productId, quantity]
      );
    }
  },

  // Cập nhật số lượng
  updateItemQty: async (cartId, productId, quantity) => {
    if (quantity <= 0) {
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

  // Tạo đơn hàng
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

  // Thêm chi tiết đơn hàng
  addOrderDetails: async (orderId, items, conn) => {
    const connection = conn || db;
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

  // Trừ tồn kho
  updateProductStock: async (items, conn) => {
    const connection = conn || db;
    for (const item of items) {
      // 1. Lấy công thức của món
      const [recipe] = await connection.query(
        "SELECT * FROM CONG_THUC WHERE ma_san_pham = ?",
        [item.ma_san_pham]
      );

      // 2. Trừ từng nguyên liệu
      if (recipe.length > 0) {
        for (const ing of recipe) {
          const amountNeeded = ing.so_luong_can * item.so_luong;
          await connection.query(
            "UPDATE KHO SET so_luong = so_luong - ? WHERE ma_nguyen_lieu = ?",
            [amountNeeded, ing.ma_nguyen_lieu]
          );
        }
      }
    }
  },

  // Xóa giỏ hàng
  clearCart: async (cartId, conn) => {
    const connection = conn || db;
    await connection.query(
      "DELETE FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ?",
      [cartId]
    );
  },
};

module.exports = CartModel;
