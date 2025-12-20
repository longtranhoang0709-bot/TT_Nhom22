const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const upload = require("../middlewares/uploadMiddleware"); // Dùng lại middleware upload ảnh

// Public: Ai cũng xem được banner
router.get("/banners", contentController.getBanners);

// Admin: Thêm/Xóa banner
router.post("/banners", upload.single("image"), contentController.createBanner);
router.delete("/banners/:id", contentController.deleteBanner);

module.exports = router;
