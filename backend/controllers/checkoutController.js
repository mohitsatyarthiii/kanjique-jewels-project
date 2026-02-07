import Razorpay from "razorpay";
import { Cart } from "../models/Cart.js";
import { Payment } from "../models/Payment.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order for test payment
export const createTestOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate cart with product details
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "title mainImages basePrice baseSalePrice variants"
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Cart is empty" 
      });
    }

    // Calculate amount from cart items (use item.price which already has the sale price)
    const amount = cart.items.reduce((sum, item) => {
      const price = item.price || 0;
      return sum + (price * item.quantity);
    }, 0) * 100; // Convert to paise

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid order amount"
      });
    }

    const options = {
      amount: Math.round(amount), // Ensure integer
      currency: "INR",
      receipt: `rcpt_test_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Save order in DB including cart items
    const payment = new Payment({
      user: userId,
      razorpay_order_id: order.id,
      amount: amount,
      currency: "INR",
      status: "created",
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price || 0,
        variant: item.variant || null,
        variantDetails: item.variantDetails || null
      })),
    });

    await payment.save();

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error creating order",
      details: err.message 
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed"
      });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "paid"
      },
      { new: true }
    );

    // Clear cart after successful payment
    if (payment) {
      await Cart.findOneAndUpdate(
        { user: payment.user },
        { items: [], totalItems: 0, totalPrice: 0, totalSavings: 0 }
      );
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      payment
    });

  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({
      success: false,
      error: "Server error verifying payment"
    });
  }
};

// Get user payments
export const getTestPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("items.product", "title mainImages")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      payments 
    });
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};