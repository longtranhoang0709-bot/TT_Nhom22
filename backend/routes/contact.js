const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const verifyToken = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Public: Khách gửi tin nhắn
router.post("/", contactController.submitContact);

// Admin: Xem và xóa tin nhắn
router.get(
  "/",
  verifyToken,
  roleMiddleware("Admin"),
  contactController.getAllContacts
);
router.delete(
  "/:id",
  verifyToken,
  roleMiddleware("Admin"),
  contactController.deleteContact
);

module.exports = router;
