import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

// DEBUG MIDDLEWARE - Add this to see what's happening
orderRouter.use((req, res, next) => {
  console.log("=== ORDER ROUTE DEBUG ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);
  console.log("Request Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Request Cookies:", req.cookies);
  console.log("Authorization Header:", req.headers.authorization);
  console.log("========================");
  next();
});

// TEST ENDPOINT - No auth required
orderRouter.get('/test-no-auth', (req, res) => {
  console.log("=== TEST NO AUTH ENDPOINT HIT ===");
  res.json({
    success: true,
    message: "Test endpoint working - no auth required",
    timestamp: new Date().toISOString()
  });
});

// TEST ENDPOINT with auth
orderRouter.post('/test', authUser, (req, res) => {
  console.log("=== TEST ORDER ENDPOINT ===");
  console.log("User ID:", req.userId);
  console.log("Request Body:", JSON.stringify(req.body, null, 2));
  
  res.json({
    success: true,
    message: "Test successful",
    userId: req.userId,
    bodyReceived: req.body
  });
});

// Place order with COD
orderRouter.post('/cod', authUser, placeOrderCOD);

orderRouter.post('/stripe', authUser, placeOrderStripe);

// Get user's orders (authenticated user)
orderRouter.get('/user', authUser, getUserOrders);

// DEBUG SELLER AUTH - Test seller authentication
orderRouter.get('/test-seller-auth', (req, res, next) => {
  console.log("=== TESTING SELLER AUTH ===");
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);
  console.log("SELLER_EMAIL from env:", process.env.SELLER_EMAIL);
  next();
}, authSeller, (req, res) => {
  console.log("=== SELLER AUTH PASSED ===");
  console.log("Seller data:", req.seller);
  res.json({
    success: true,
    message: "Seller authentication successful",
    seller: req.seller
  });
});

// ✅ FIXED: Add the missing seller-orders route that your frontend is calling
orderRouter.get('/seller-orders', authSeller, getAllOrders);

// Keep existing routes for compatibility
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/seller-1', authSeller, getAllOrders);
orderRouter.get('/seller/:id', authSeller, getAllOrders);

// Add a simple test endpoint to verify auth is working
orderRouter.get('/test-auth', authSeller, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication successful',
    seller: req.seller 
  });
});

export default orderRouter;