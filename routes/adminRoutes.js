import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  deleteUser,
  updateUserProfile,
} from "../controller/authController.js";

const router = express.Router();

// Define routes
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.put("/users/:id", protect, adminOnly, updateUserProfile);

export default router;
