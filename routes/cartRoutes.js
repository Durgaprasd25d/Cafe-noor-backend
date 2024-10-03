import express from "express";
import {
  addToCart,
  updateCartItem,
  removeCartItem,
  getCartItems,
  getAllCartItems,
} from "../controller/cartController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Add item to cart
router.post("/cart/add", protect, addToCart); // Use protect middleware

// Update item in cart
router.put("/cart/update", protect, updateCartItem); // Use protect middleware

// Remove item from cart
router.delete("/cart/remove", protect, removeCartItem); // Use protect middleware

// Get cart items
router.get("/cart/:userId", protect, getCartItems); // Use protect middleware

//Get all cart items
router.get("/cart", protect, getAllCartItems); // Use protect middleware

export default router;
