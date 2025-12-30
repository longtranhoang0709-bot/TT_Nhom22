const express = require("express");
const router = express.Router();
// Import Controller để xử lý logic
const authController = require("../controllers/authController");

// --- CÁC ROUTE GỌI VÀO CONTROLLER ---

// 1. Đăng ký
router.post("/register", authController.register);

// 2. Đăng nhập
router.post("/login", authController.login);

// 3. Refresh Token (Cấp lại token mới)
router.post("/refresh", authController.refresh);

// 4. Đăng xuất
router.post("/logout", authController.logout);

// 5. Quên mật khẩu & Đặt lại mật khẩu
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
