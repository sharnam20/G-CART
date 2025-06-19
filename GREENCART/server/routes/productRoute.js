import express from 'express';
import { upload, handleMulterError } from '../config/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/productController.js';

const productRouter = express.Router();

// Add product route with proper error handling
productRouter.post('/add', 
  upload.array("images", 10), 
  handleMulterError, // Handle multer errors
  authSeller, 
  addProduct
);

// List all products
productRouter.get('/list', productList);

// Get single product by ID
productRouter.post('/id', productById);

// Update product stock
productRouter.post('/stock', authSeller, changeStock);

export default productRouter;