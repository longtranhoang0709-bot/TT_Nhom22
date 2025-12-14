const CartModel = require("../models/cartModel");
const db = require("../db");

// Lấy giỏ hàng
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware auth
    const cartId = await CartModel.findOrCreateCart(userId);
    const items = await CartModel.getCartDetails(cartId);

    // Tính tổng tiền
    const total = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );

    res.status(200).json({ cartId, items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Thêm vào giỏ
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    // 1. Kiểm tra tồn kho
    const [stock] = await db.query(
      "SELECT so_luong FROM KHO WHERE ma_san_pham = ?",
      [productId]
    );
    if (stock.length === 0 || stock[0].so_luong < quantity) {
      return res
        .status(400)
        .json("Sản phẩm đã hết hàng hoặc không đủ số lượng!");
    }

    // 2. Thêm vào giỏ
    const cartId = await CartModel.findOrCreateCart(userId);
    await CartModel.addItem(cartId, productId, quantity || 1);

    // 3. --- Tính lại tổng tiền để trả về cho Frontend ---
    const items = await CartModel.getCartDetails(cartId);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );

    res.status(200).json({
      message: "Đã thêm vào giỏ hàng!",
      totalAmount: totalAmount, // Trả về tổng tiền mới nhất
      cartId: cartId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Cập nhật số lượng
exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const cartId = await CartModel.findOrCreateCart(userId);
    await CartModel.updateItemQty(cartId, productId, quantity);

    // --- Tính lại tổng ---
    const items = await CartModel.getCartDetails(cartId);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );

    res.status(200).json({ message: "Đã cập nhật!", totalAmount });
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Xóa sản phẩm
exports.removeCartItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const cartId = await CartModel.findOrCreateCart(userId);
    await CartModel.removeItem(cartId, id);

    // --- Tính lại tổng ---
    const items = await CartModel.getCartDetails(cartId);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );

    res.status(200).json({ message: "Đã xóa sản phẩm!", totalAmount });
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Checkout (Tạo đơn hàng đơn giản - demo)
exports.checkout = async (req, res) => {
  const userId = req.user.id;
  const { address, phone, note } = req.body; // Thông tin giao hàng

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Lấy thông tin giỏ
    const cartId = await CartModel.findOrCreateCart(userId);
    const items = await CartModel.getCartDetails(cartId);

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json("Giỏ hàng trống!");
    }

    // 2. Tính tổng tiền
    const totalAmount = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );

    // 3. Tạo đơn hàng (Bảng DON_HANG)
    const [orderRes] = await conn.query(
      `
            INSERT INTO DON_HANG (ma_nguoi_dung, tong_tien, dia_chi_giao, so_dien_thoai, ghi_chu, trang_thai)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        `,
      [userId, totalAmount, address, phone, note]
    );

    const orderId = orderRes.insertId;

    // 4. Chuyển chi tiết giỏ -> Chi tiết đơn hàng (DON_HANG_CHI_TIET)
    const orderItems = items.map((item) => [
      orderId,
      item.ma_san_pham,
      item.so_luong,
      item.gia,
    ]);

    await conn.query(
      `INSERT INTO CHI_TIET_DON_HANG (ma_don_hang, ma_san_pham, so_luong, don_gia) VALUES ?`,
      [orderItems]
    );

    // --- TRỪ TỒN KHO ---
    // Duyệt qua từng món để trừ số lượng trong bảng KHO
    for (const item of items) {
      await conn.query(
        "UPDATE KHO SET so_luong = so_luong - ? WHERE ma_san_pham = ?",
        [item.so_luong, item.ma_san_pham]
      );
    }

    // 5. Xóa giỏ hàng
    await conn.query("DELETE FROM CHI_TIET_GIO_HANG WHERE ma_gio_hang = ?", [
      cartId,
    ]);

    await conn.commit();
    res.status(200).json({ message: "Đặt hàng thành công!", orderId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json("Lỗi thanh toán!");
  } finally {
    conn.release();
  }
};
