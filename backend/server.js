import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/adminProductRoutes.js";
import productsRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import ordersRoutes from './routes/ordersRoutes.js';
import userOrdersRoutes from "./routes/userOrdersRoutes.js"; 
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import { connectDB } from './config/db.js';

dotenv.config();
const app = express();

// For ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();
// CORS Configuration for Production
const allowedOrigins = [
  "http://localhost:5173",
  "https://kanjique-jewels-project-2.onrender.com",
  "https://kanjiquejewels.com",  // ✅ अपने actual domain के साथ replace करें
  "https://www.kanjiquejewels.com",  // ✅ www version भी add करें
  "http://localhost:3000"  // ✅ अगर React dev server use करते हैं
];

// Production में cookies के लिए special CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Production में specific origins allow करें
    if (process.env.NODE_ENV === 'production') {
      // Production: Only allow specific domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log(`CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }
    } else {
      // Development: Allow all
      return callback(null, true);
    }
  },
  credentials: true, // ✅ IMPORTANT: Cookies allow करने के लिए
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'], // ✅ Cookies expose करने के लिए
  maxAge: 86400 // 24 hours
};

// Handle preflight requests
app.options('', cors());

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", productRoutes);
app.use("/api/product", productsRoutes);
app.use("/api/cart", cartRoutes); // Fixed: added /api/cart prefix
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/checkout", checkoutRoutes); // Fixed: added /api/checkout prefix
app.use("/api/profile", profileRoutes); // Fixed: added /api/profile prefix
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/user/orders", userOrdersRoutes);
app.use("/api/location", locationRoutes); // Fixed: added /api/location prefix

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Get port from environment or use 5000
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on http://${HOST}:${PORT}`);
  console.log(`✅ Health check: http://${HOST}:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;