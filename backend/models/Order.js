import mongoose from "mongoose";

// Function to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price in INR
  variant: { type: mongoose.Schema.Types.ObjectId },
  variantDetails: { type: Object }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  
  items: [orderItemSchema],
  
  // Amount in INR (original)
  subtotalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // Currency info for display
  displayCurrency: { type: String, default: "INR" },
  displayAmount: { type: Number }, // Amount in display currency
  
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
    default: "pending"
  },
  
  shippingAddress: { type: String, required: true },
  billingAddress: { type: String },
  
  notes: { type: String },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  deliveredAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Generate order number if not exists
  if (!this.orderNumber) {
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 5) {
      const orderNumber = generateOrderNumber();
      const existingOrder = await mongoose.model('Order').findOne({ orderNumber });
      
      if (!existingOrder) {
        this.orderNumber = orderNumber;
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      // Fallback
      this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
  }
  
  next();
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model("Order", orderSchema);