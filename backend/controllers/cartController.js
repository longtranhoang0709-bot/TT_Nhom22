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
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Phải là số nguyên và lớn hơn 0
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json("Số lượng sản phẩm phải là số nguyên dương (1, 2, 3...)!");
    }

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
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json("Số lượng không hợp lệ! Vui lòng chọn số lớn hơn 0.");
    }

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

// Checkout giỏ hàng
exports.checkout = async (req, res) => {
  const userId = req.user.id;
  const { address, phone, note, paymentMethod, couponCode } = req.body;

  // 1. Validation (Bắt buộc nhập thông tin giao hàng)
  if (!address || !phone) {
    return res
      .status(400)
      .json("Vui lòng nhập địa chỉ và số điện thoại nhận hàng!");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction(); // Bắt đầu giao dịch

    // 2. Lấy dữ liệu giỏ hàng
    const cartId = await CartModel.findOrCreateCart(userId);
    const items = await CartModel.getCartDetails(cartId);

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json("Giỏ hàng trống!");
    }

    // 3. Tính toán tiền nong & Mã giảm giá
    const rawTotal = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );
    let discountAmount = 0;
    let finalTotal = rawTotal;
    let appliedCoupon = null;

    if (couponCode) {
      // Kiểm tra mã giảm giá
      const [coupons] = await conn.query(
        "SELECT * FROM KHUYEN_MAI WHERE ma_code = ?",
        [couponCode]
      );

      if (coupons.length > 0) {
        const coupon = coupons[0];
        const now = new Date();

        // Check ngày hết hạn & hạn mức tối thiểu
        if (
          now >= new Date(coupon.ngay_bat_dau) &&
          now <= new Date(coupon.ngay_ket_thuc) &&
          rawTotal >= coupon.don_toi_thieu
        ) {
          discountAmount = rawTotal * (coupon.giam_phan_tram / 100);
          finalTotal = rawTotal - discountAmount;
          appliedCoupon = couponCode;
        }
      }
    }

    // 4. GỌI MODEL ĐỂ XỬ LÝ DATABASE
    const method = paymentMethod || "COD";

    // Tạo object dữ liệu đơn hàng để gửi sang Model
    const orderData = {
      finalTotal,
      discountAmount,
      appliedCoupon,
      address,
      phone,
      note,
      method,
    };

    // Tạo đơn hàng (Trả về Order ID)
    const orderId = await CartModel.createOrder(userId, orderData, conn);

    // Lưu chi tiết đơn hàng
    await CartModel.addOrderDetails(orderId, items, conn);

    // Trừ tồn kho
    await CartModel.updateProductStock(items, conn);

    // Xóa giỏ hàng
    await CartModel.clearCart(cartId, conn);

    // Hoàn tất giao dịch
    await conn.commit();

    // TRẢ VỀ KẾT QUẢ CHO FRONTEND
    let message = "Đặt hàng thành công! Vui lòng chuẩn bị tiền mặt.";
    let qrUrl = null;

    if (method === "Momo") {
      message = "Vui lòng quét mã Momo để thanh toán!";
      qrUrl = "/backend/uploads/QRMoMo.jpg";
    }

    return res.status(200).json({
      message: message,
      orderId: orderId,
      originalPrice: rawTotal, // Giá gốc
      discount: discountAmount, // Tiền giảm
      totalAmount: finalTotal, // Khách phải trả
      qrCodeUrl: qrUrl, // Link QR
    });
  } catch (err) {
    await conn.rollback(); // Gặp lỗi thì quay lui
    console.error(err);
    res.status(500).json("Lỗi thanh toán: " + err.message);
  } finally {
    conn.release(); // Trả kết nối về bể chứa
  }
};
