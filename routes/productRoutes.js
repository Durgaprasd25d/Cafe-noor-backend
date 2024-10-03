import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controller/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Define routes for product creation, retrieval, updating, and deletion
router.post('/products', protect, adminOnly, upload.single('image'), createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);

export default router;
