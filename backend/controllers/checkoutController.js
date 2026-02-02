import Razorpay from "razorpay";
import { Cart } from "../models/Cart.js";
import { Payment } from "../models/Payment.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order for test payment
// Create order for test payment
export const createTestOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product", "title price images");
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const amount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100; // paise

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_test_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Save order in DB including cart items
    const payment = new Payment({
      user: userId,
      razorpay_order_id: order.id,
      amount,
      currency: "INR",
      status: "created",
      items: cart.items.map(it => ({
        product: it.product._id,
        quantity: it.quantity,
        price: it.product.price,
      })),
    });

    await payment.save();

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// Optional: List all test payments for user
export const getTestPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
