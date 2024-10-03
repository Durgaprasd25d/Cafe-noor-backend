import express from "express";
import {
  createOrder,
  updateOrderStatus,
  getOrderHistory,
  confirmOrder,
  updateShipping,
  getAllOrders,
} from "../controller/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new order
router.post("/orders", protect, createOrder);

// Update order status - Only admins should have access
router.put("/orders/:id", protect, adminOnly, updateOrderStatus);

// Get order history
router.get("/orders", protect, getOrderHistory);

// Confirm order
router.post("/order/confirm", protect, confirmOrder);

// Update shipping information
router.post("/order/update-shipping", protect, updateShipping);
// Get all orders - Only admins should have access

router.get("/admin/orders", protect, adminOnly, getAllOrders);

export default router;
