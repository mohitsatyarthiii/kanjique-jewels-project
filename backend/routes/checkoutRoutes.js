import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { 
  createOrder, 
  verifyPayment,
  razorpayWebhook,
  getOrderDetails,
  getUserOrders,
  cancelOrder,
  buyNow
} from "../controllers/checkoutController.js";

const router = express.Router();

// Create order from cart
router.post("/order", requireAuth, createOrder);

// Buy Now - Direct checkout
router.post("/buy-now", requireAuth, buyNow);

// Verify payment (client-side)
router.post("/verify", requireAuth, verifyPayment);

// Razorpay webhook (no auth required for webhook)
router.post("/webhook", razorpayWebhook);

// Get order details
router.get("/order/:orderId", requireAuth, getOrderDetails);

// Get user orders
router.get("/orders", requireAuth, getUserOrders);

// Cancel order
router.put("/order/:orderId/cancel", requireAuth, cancelOrder);

export default router;