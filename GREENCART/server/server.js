import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './config/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// ✅ Wrap async calls in IIFE for top-level await compatibility
(async () => {
  try {
    await connectDB();
    await connectCloudinary();
    console.log("DB and Cloudinary connected successfully");
  } catch (err) {
    console.error("Error during DB/Cloudinary setup", err);
  }
})();

// ✅ CORS Setup
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174','https://g-cart-dun.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));

// ✅ Stripe Webhook route before json parser
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ Use app.listen only when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// ✅ Export for Vercel
export default app;
