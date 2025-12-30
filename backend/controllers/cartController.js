const CartModel = require("../models/cartModel");
const db = require("../db");
// Kiểm tra tồn kho nguyên liệu cho sản phẩm
const checkStockAvailability = async (productId, quantityNeeded) => {
    const [recipe] = await db.query("SELECT * FROM CONG_THUC WHERE ma_san_pham = ?", [productId]);
    if (recipe.length === 0) return true; 

    for (const item of recipe) {
        const [stockRes] = await db.query(
            "SELECT so_luong FROM KHO WHERE ma_nguyen_lieu = ?", 
            [item.ma_nguyen_lieu]
        );
        const currentStock = stockRes.length > 0 ? parseFloat(stockRes[0].so_luong) : 0;
        const required = parseFloat(item.so_luong_can) * quantityNeeded;

        if (currentStock < required) return false;
    }
    return true;
};
// Lấy giỏ hàng
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await CartModel.findOrCreateCart(userId);
    const items = await CartModel.getCartDetails(cartId);
    const total = items.reduce((sum, item) => sum + item.gia * item.so_luong, 0);
    res.status(200).json({ cartId, items, total });
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json("Số lượng phải là số nguyên dương!");
    }

    // 1. Kiểm tra tồn kho 
    const isAvailable = await checkStockAvailability(productId, quantity);
    if (!isAvailable) {
        return res.status(400).json("Món này tạm hết nguyên liệu!");
    }
    // 2. Thêm vào giỏ
    const cartId = await CartModel.findOrCreateCart(userId);
    await CartModel.addItem(cartId, productId, quantity);

    const items = await CartModel.getCartDetails(cartId);
    const totalAmount = items.reduce((sum, item) => sum + item.gia * item.so_luong, 0);

    res.status(200).json({ message: "Đã thêm vào giỏ!", totalAmount, cartId });
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
      return res.status(400).json("Số lượng không hợp lệ!");
    }

    // Kiểm tra tồn kho trước khi update
    const isAvailable = await checkStockAvailability(productId, quantity);
    if (!isAvailable) {
      return res
        .status(400)
        .json("Số lượng yêu cầu vượt quá nguyên liệu tồn kho!");
    }

    const cartId = await CartModel.findOrCreateCart(userId);
    await CartModel.updateItemQty(cartId, productId, quantity);

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

// Checkout
exports.checkout = async (req, res) => {
  const userId = req.user.id;
  const { address, phone, note, paymentMethod, couponCode } = req.body;

  if (!address || !phone) {
    return res
      .status(400)
      .json("Vui lòng nhập địa chỉ và số điện thoại nhận hàng!");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const cartId = await CartModel.findOrCreateCart(userId);
    const items = await CartModel.getCartDetails(cartId);

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json("Giỏ hàng trống!");
    }

    const rawTotal = items.reduce(
      (sum, item) => sum + item.gia * item.so_luong,
      0
    );
    let discountAmount = 0;
    let finalTotal = rawTotal;
    let appliedCoupon = null;

    if (couponCode) {
      const [coupons] = await conn.query(
        "SELECT * FROM KHUYEN_MAI WHERE ma_code = ?",
        [couponCode]
      );
      if (coupons.length > 0) {
        const coupon = coupons[0];
        const now = new Date();
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

    const method = paymentMethod || "COD";
    const orderData = {
      finalTotal,
      discountAmount,
      appliedCoupon,
      address,
      phone,
      note,
      method,
    };

    const orderId = await CartModel.createOrder(userId, orderData, conn);
    await CartModel.addOrderDetails(orderId, items, conn);

    await CartModel.updateProductStock(items, conn);

    await CartModel.clearCart(cartId, conn);
    await conn.commit();

    let message = "Đặt hàng thành công! Vui lòng chuẩn bị tiền mặt.";
    let qrUrl = null;
    if (method === "Momo") {
      message = "Vui lòng quét mã Momo để thanh toán!";
      qrUrl = "/backend/uploads/QRMoMo.jpg";
    }

    if (method === "ChuyenKhoan") {
      message = "Vui lòng quét mã QR để thanh toán!";

      const BANK_ID = "TCB";
      const ACCOUNT_NO = "19038209866011";
      const ACCOUNT_NAME = "DO HOANG PHUOC";
      const TEMPLATE = "compact2";

      const DESCRIPTION = `DH${orderId}`;

      qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${finalTotal}&addInfo=${DESCRIPTION}&accountName=${encodeURIComponent(
        ACCOUNT_NAME
      )}`;
    }

    return res.status(200).json({
      message: message,
      orderId: orderId,
      originalPrice: rawTotal,
      discount: discountAmount,
      totalAmount: finalTotal,
      qrCodeUrl: qrUrl,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json("Lỗi thanh toán: " + err.message);
  } finally {
    conn.release();
  }
};
