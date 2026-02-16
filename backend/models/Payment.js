import mongoose from "mongoose";

const paymentItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price in INR
  variant: { type: mongoose.Schema.Types.ObjectId },
  variantDetails: { type: Object }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  
  // Amount in smallest unit (paise/cents) for Razorpay
  amount: { type: Number, required: true },
  
  // Currency info
  currency: { type: String, default: "INR" },
  originalCurrency: { type: String, default: "INR" },
  originalAmount: { type: Number }, // Original INR amount before conversion
  
  // Exchange rate used
  exchangeRate: { type: Number, default: 1 },
  
  status: { 
    type: String, 
    enum: ["created", "pending", "paid", "failed", "refunded"], 
    default: "created" 
  },
  
  items: [paymentItemSchema],
  
  metadata: {
    cartTotal: { type: Number },
    totalItems: { type: Number },
    totalSavings: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    subtotalAmount: { type: Number },
    totalAmount: { type: Number },
    shippingAddress: { type: String },
    type: { type: String, enum: ["cart", "buyNow"], default: "cart" }
  },
  
  paymentMethod: { type: String },
  bank: { type: String },
  wallet: { type: String },
  vpa: { type: String },
  email: { type: String },
  contact: { type: String },
  error: { type: String },
  
  paidAt: { type: Date },
  failedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);