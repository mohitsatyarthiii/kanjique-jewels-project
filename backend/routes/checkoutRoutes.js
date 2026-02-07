import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { 
  createTestOrder, 
  getTestPayments,
  verifyPayment 
} from "../controllers/checkoutController.js";

const router = express.Router();

// Create test order
router.post("/order", requireAuth, createTestOrder);

// Verify payment
router.post("/verify", requireAuth, verifyPayment);

// Get user test payments
router.get("/payments", requireAuth, getTestPayments);

export default router;