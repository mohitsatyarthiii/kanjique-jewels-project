import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { Payment } from "../models/Payment.js"; // Payment model import karo
import { Order } from "../models/Order.js"; // Agar order bhi use karna ho toh

const router = express.Router();

// Admin: Get all payments (orders from payments table)
router.get("/", requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    console.log("📊 Admin fetching payments data...");
    
    // Payments table se data lao with user and product details
    const payments = await Payment.find()
      .populate("user", "name email") // User details
      .populate("items.product", "title price images category") // Product details
      .sort({ createdAt: -1 }); // Latest first

    console.log(`✅ Found ${payments.length} payments`);
    
    // Format the data properly for frontend
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      orderId: payment.razorpay_order_id, // Razorpay order ID
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
      user: payment.user, // User details
      items: payment.items || [], // Payment items
      totalAmount: payment.amount / 100, // Convert from paise to rupees
      amountInPaise: payment.amount,
      currency: payment.currency,
      status: payment.status, // created, paid, failed
      paymentStatus: payment.status, // Alias for frontend
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      
      // Frontend ke liye additional fields (optional)
      orderStatus: getOrderStatusFromPayment(payment.status), // Map to order status
      paymentMethod: "Razorpay", // Fixed for now
      itemCount: payment.items?.length || 0
    }));

    res.json({ 
      success: true, 
      orders: formattedPayments, // Frontend expects "orders" key
      payments: formattedPayments, // Extra key for clarity
      count: payments.length 
    });

  } catch (err) {
    console.error("❌ Admin payments fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Helper function to map payment status to order status
function getOrderStatusFromPayment(paymentStatus) {
  const statusMap = {
    'paid': 'processing', // Payment done, order processing
    'created': 'pending', // Payment initiated but not completed
    'failed': 'cancelled' // Payment failed, order cancelled
  };
  return statusMap[paymentStatus] || 'pending';
}

// Get single payment/order by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("items.product", "title price images category description");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ 
      success: true, 
      payment,
      order: formatPaymentAsOrder(payment) // Frontend compatibility
    });

  } catch (err) {
    console.error("Admin get payment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update payment/order status
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { status } = req.body;
    
    if (!['created', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ 
      success: true, 
      message: "Payment status updated",
      payment 
    });

  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Helper function to format payment as order
function formatPaymentAsOrder(payment) {
  return {
    _id: payment._id,
    orderId: payment.razorpay_order_id,
    user: payment.user,
    items: payment.items,
    totalAmount: payment.amount / 100,
    status: getOrderStatusFromPayment(payment.status),
    paymentStatus: payment.status,
    createdAt: payment.createdAt,
    paymentMethod: "Razorpay",
    razorpayPaymentId: payment.razorpay_payment_id
  };
}

export default router;