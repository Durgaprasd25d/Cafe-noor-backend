import express from "express";
import { register, login, getAllUsers } from "../controller/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/register", upload.single('profileImage'), register);
router.post("/login", login);
router.get("/users", protect, adminOnly, getAllUsers);

export default router; // Use default export
