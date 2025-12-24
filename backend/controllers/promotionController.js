const PromotionModel = require("../models/promotionModel");

// 1. Lấy danh sách khuyến mãi
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await PromotionModel.getAll();
    res.status(200).json(promotions);
  } catch (err) {
    res.status(500).json("Lỗi server: " + err.message);
  }
};

// 2. Tạo mã khuyến mãi mới
exports.createPromotion = async (req, res) => {
  try {
    const { code, description, discount, start, end, minOrder } = req.body;

    // Gọi Model để tìm xem mã đã tồn tại chưa
    const existingCode = await PromotionModel.findByCode(code);
    if (existingCode) {
      return res.status(400).json("Mã này đã tồn tại!");
    }

    // Gọi Model để lưu
    await PromotionModel.create({
      code: code.toUpperCase(), // Viết hoa mã
      description: description || "",
      discount: discount,
      start: start,
      end: end,
      minOrder: minOrder || 0,
    });

    res.status(201).json("Tạo mã giảm giá thành công!");
  } catch (err) {
    res.status(500).json("Lỗi tạo mã: " + err.message);
  }
};
// 3. Xóa mã giảm giá
exports.deletePromotion = async (req, res) => {
  try {
    await PromotionModel.delete(req.params.id);
    res.status(200).json("Đã xóa mã giảm giá!");
  } catch (err) {
    res.status(500).json("Lỗi xóa: " + err.message);
  }
};

// Cập nhật mã
exports.updatePromotion = async (req, res) => {
  try {
    const { code } = req.body;
    await PromotionModel.update(req.params.id, {
      code: req.body.code.toUpperCase(),
      description: req.body.description || "",
      discount: req.body.discount,
      start: req.body.start,
      end: req.body.end,
      minOrder: req.body.minOrder || 0,
    });
    res.status(200).json("Cập nhật thành công!");
  } catch (err) {
    res.status(500).json("Lỗi cập nhật: " + err.message);
  }
};

// Kiểm tra mã giảm giá (Logic chính nằm ở đây)
exports.checkCoupon = async (req, res) => {
  try {
    const { code, totalOrderValue } = req.body;

    // 1. Tìm mã trong DB thông qua Model
    const coupon = await PromotionModel.findByCode(code);

    if (!coupon) {
      return res.status(404).json("Mã không tồn tại!");
    }

    // 2. Logic kiểm tra ngày tháng & Hạn mức
    const now = new Date();
    const start = new Date(coupon.ngay_bat_dau);
    const end = new Date(coupon.ngay_ket_thuc);

    if (now < start || now > end) {
      return res.status(400).json("Mã này chưa bắt đầu hoặc đã hết hạn!");
    }

    // Kiểm tra đơn tối thiểu
    if (totalOrderValue < coupon.don_toi_thieu) {
      return res
        .status(400)
        .json(
          `Mã này chỉ áp dụng cho đơn hàng từ ${coupon.don_toi_thieu.toLocaleString()}đ trở lên!`
        );
    }

    res.status(200).json({
      message: "Mã hợp lệ!",
      discountPercent: coupon.giam_phan_tram,
      minOrder: coupon.don_toi_thieu,
    });
  } catch (err) {
    res.status(500).json("Lỗi kiểm tra mã: " + err.message);
  }
};
