const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const roleMiddleware = require("../middlewares/roleMiddleware");
const verifyToken = require("../middlewares/authMiddleware");

// Khách kiểm tra mã
router.post("/check", promotionController.checkCoupon);

// Admin quản lý
router.get(
  "/",
  verifyToken,
  roleMiddleware("Admin"),
  promotionController.getAllPromotions
);

router.post(
  "/",
  verifyToken,
  roleMiddleware("Admin"),
  promotionController.createPromotion
);

module.exports = router;
