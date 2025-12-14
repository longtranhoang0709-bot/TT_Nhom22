const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware"); //

// Tất cả các route giỏ hàng đều yêu cầu đăng nhập
router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:id", cartController.removeCartItem);
router.post("/checkout", cartController.checkout);

module.exports = router;
