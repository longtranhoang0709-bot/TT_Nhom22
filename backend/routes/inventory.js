const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const verifyToken = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/",
  verifyToken,
  roleMiddleware("Admin"),
  inventoryController.getInventory
);
router.post(
  "/:id/restock",
  verifyToken,
  roleMiddleware("Admin"),
  inventoryController.restock
);
router.get(
  "/ingredients",
  verifyToken,
  roleMiddleware("Admin"),
  inventoryController.getAllIngredients
);
router.post(
  "/add",
  verifyToken,
  roleMiddleware("Admin"),
  inventoryController.addIngredient
);

module.exports = router;
