const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/stats", roleMiddleware("Admin"), orderController.getStats);
// User xem đơn của mình
router.get("/my", orderController.getMyOrders);

router.put("/:id/cancel", authMiddleware, orderController.cancelOrder);

// User/Admin xem chi tiết
router.get("/:id", orderController.getOrderDetail);

// Admin xem tất cả
router.get("/", roleMiddleware("Admin"), orderController.getAllOrders);

// Admin cập nhật trạng thái
router.put(
  "/:id/status",
  roleMiddleware("Admin"),
  orderController.updateOrderStatus
);
// Admin hủy đơn hàng
router.put(
  "/:id/admin-cancel",
  roleMiddleware("Admin"),
  orderController.adminCancelOrder
);

module.exports = router;
