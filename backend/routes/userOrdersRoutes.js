import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { Payment } from "../models/Payment.js";

const router = express.Router();

// Get orders for logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`📦 Fetching orders for user: ${userId}`);
    
    // Payments table se data lao (yeh hi orders hai ab)
    const payments = await Payment.find({ user: userId })
      .populate("items.product", "title price images category description")
      .sort({ createdAt: -1 }); // Latest first
    
    console.log(`✅ Found ${payments.length} payments for user`);
    
    // Format payments as orders for frontend
    const formattedOrders = payments.map(payment => {
      // Map payment status to order status
      let orderStatus = "pending";
      if (payment.status === "paid") orderStatus = "processing";
      if (payment.status === "failed") orderStatus = "cancelled";
      
      return {
        _id: payment._id,
        orderId: payment.razorpay_order_id || `PAY-${payment._id.toString().slice(-8).toUpperCase()}`,
        user: {
          _id: payment.user,
          name: req.user.name,
          email: req.user.email
        },
        items: payment.items.map(item => ({
          _id: item._id,
          product: item.product || {
            _id: item.product,
            title: "Product",
            price: item.price,
            images: []
          },
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        amount: payment.amount, // in paise
        totalAmount: payment.amount / 100, // in rupees
        status: orderStatus,
        paymentStatus: payment.status,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_signature: payment.razorpay_signature,
        shippingAddress: req.user.address ? {
          address: req.user.address
        } : null,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        // Frontend ke liye extra fields
        itemCount: payment.items.length,
        formattedDate: new Date(payment.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      };
    });

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
      message: `Found ${formattedOrders.length} orders`
    });

  } catch (err) {
    console.error("❌ User orders fetch error:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message
    });
  }
});

// Get single order by ID (user-specific)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const payment = await Payment.findOne({
      _id: orderId,
      user: userId
    }).populate("items.product", "title price images category description");

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Format as order
    const order = {
      _id: payment._id,
      orderId: payment.razorpay_order_id,
      items: payment.items,
      amount: payment.amount,
      totalAmount: payment.amount / 100,
      status: payment.status === "paid" ? "processing" : 
              payment.status === "created" ? "pending" : "cancelled",
      paymentStatus: payment.status,
      razorpay_payment_id: payment.razorpay_payment_id,
      createdAt: payment.createdAt,
      paymentMethod: "Razorpay"
    };

    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error("Get single order error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

export default router;