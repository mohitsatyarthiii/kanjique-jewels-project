import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  amount: { type: Number, required: true }, // in INR paisa
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ]
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);
