import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createTestOrder, getTestPayments } from "../controllers/checkoutController.js";

const router = express.Router();

// Create test order
router.post("/api/test/checkout/order", requireAuth, createTestOrder);

// Get user test payments
router.get("/api/test/checkout/payments", requireAuth, getTestPayments);

export default router;
