import Razorpay from "razorpay";
import crypto from "crypto";
import { Cart } from "../models/Cart.js";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { getRates, convertAmount } from '../utils/exchangeRates.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Validate environment
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Razorpay credentials missing!");
}

// Log Razorpay mode on startup
const keyType = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'LIVE' : 'TEST';
console.log(`✅ Razorpay initialized in ${keyType} mode`);
console.log(`📍 Key ID: ${process.env.RAZORPAY_KEY_ID?.substring(0, 15)}...`);

// Generate unique receipt ID
const generateReceiptId = () => {
  return `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate cart with product details
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "title mainImages basePrice baseSalePrice variants stock slug",
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Validate stock and calculate amount
    let amount = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = item.product;
      
      // Check if product exists
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product} not found`,
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `${product.title} is out of stock`,
        });
      }

      // Calculate price (use sale price if available)
      const price = item.price || product.baseSalePrice || product.basePrice || 0;
      amount += price * item.quantity;
      
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: price,
        variant: item.variant || null,
        variantDetails: item.variantDetails || null,
      });
    }

    // Calculate delivery fee (free above ₹5000)
    const deliveryFee = amount > 5000 ? 0 : 99;
    const totalAmount = amount + deliveryFee; // in INR

    // Handle optional target currency
    const targetCurrency = req.body.currency || 'INR';

    // Determine amount in smallest unit for Razorpay
    let amountInSmallestUnit;
    let orderCurrency = 'INR';

    if (targetCurrency && targetCurrency !== 'INR') {
      try {
        const rates = await getRates('INR');
        const converted = convertAmount(totalAmount, rates, targetCurrency);
        if (converted == null) throw new Error('Conversion failed');
        // Assume two decimal currencies -> multiply by 100
        amountInSmallestUnit = Math.round(converted * 100);
        orderCurrency = targetCurrency;
      } catch (err) {
        console.warn('Currency conversion failed, falling back to INR', err.message || err);
        amountInSmallestUnit = Math.round(totalAmount * 100);
        orderCurrency = 'INR';
      }
    } else {
      amountInSmallestUnit = Math.round(totalAmount * 100);
    }

    if (amountInSmallestUnit < 100) { // Minimum unit (₹1 or equivalent)
      return res.status(400).json({
        success: false,
        error: "Minimum order amount is ₹1",
      });
    }

    // Razorpay order options
    const options = {
      amount: amountInSmallestUnit,
      currency: orderCurrency,
      receipt: generateReceiptId(),
      payment_capture: 1,
      notes: {
        userId: userId.toString(),
        cartId: cart._id.toString(),
      },
    };

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record in DB
    const payment = new Payment({
      user: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      items: validatedItems,
      metadata: {
        cartTotal: cart.totalPrice,
        totalItems: cart.totalItems,
        totalSavings: cart.totalSavings || 0,
        deliveryFee: deliveryFee,
        subtotalAmount: amount,
        totalAmount: totalAmount,
      },
    });

    await payment.save();

    res.json({
      success: true,
      order: razorpayOrder,
      payment_id: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      delivery: deliveryFee,
    });

    console.log("✅ Order created successfully", {
      orderId: razorpayOrder.id,
      amount: amount,
      currency: "INR",
      keyType: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + "..."
    });

  } catch (err) {
    console.error("Create order error:", err);
    
    // Handle specific Razorpay errors
    if (err.error && err.error.description) {
      return res.status(400).json({
        success: false,
        error: err.error.description,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create order. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Verify payment (client-side verification)
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details",
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed",
      });
    }

    // Find and update payment
    const payment = await Payment.findOne({
      razorpay_order_id,
      status: { $in: ["created", "pending"] },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    // Update payment status
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save();

    // Create order record
    const order = new Order({
      user: payment.user,
      payment: payment._id,
      items: payment.items,
      totalAmount: payment.amount / 100,
      currency: payment.currency,
      status: "confirmed",
      shippingAddress: req.body.shippingAddress || "",
      billingAddress: req.body.billingAddress || "",
      notes: req.body.notes || "",
    });

    await order.save();

    // Update product stock
    for (const item of payment.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: payment.user },
      {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        totalSavings: 0,
      }
    );

    // Send order confirmation email (you'll need to implement this)
    // await sendOrderConfirmationEmail(payment.user, order);

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
      },
      payment: {
        id: payment._id,
        razorpay_payment_id: payment.razorpay_payment_id,
        status: payment.status,
      },
    });

  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};

// Webhook handler (for server-side verification)
export const razorpayWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers["x-razorpay-signature"];
    
    // For raw body, req.body will be a Buffer
    let webhookBody;
    if (Buffer.isBuffer(req.body)) {
      webhookBody = req.body.toString('utf-8');
    } else {
      webhookBody = JSON.stringify(req.body);
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ status: "error", error: "Webhook secret not configured" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(webhookBody)
      .digest("hex");

    console.log("Webhook verification:", {
      receivedSignature: webhookSignature,
      generatedSignature: generatedSignature,
      match: generatedSignature === webhookSignature
    });

    if (generatedSignature !== webhookSignature) {
      console.error("Webhook signature verification failed");
      console.error("Secret used:", secret.substring(0, 10) + "...");
      return res.status(400).json({ status: "error", error: "Signature mismatch" });
    }

    // Parse body
    const payload = typeof webhookBody === 'string' ? JSON.parse(webhookBody) : req.body;
    const event = payload.event;
    const payloadData = payload.payload;

    console.log("Processing webhook event:", event);

    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payloadData.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payloadData.payment.entity);
        break;

      case "order.paid":
        await handleOrderPaid(payloadData.order.entity);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
};

// Handle captured payment
const handlePaymentCaptured = async (payment) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpay_order_id: payment.order_id },
      {
        razorpay_payment_id: payment.id,
        status: "paid",
        paidAt: new Date(payment.created_at * 1000),
        paymentMethod: payment.method,
        bank: payment.bank,
        wallet: payment.wallet,
        vpa: payment.vpa,
        email: payment.email,
        contact: payment.contact,
      }
    );
  } catch (err) {
    console.error("Error handling payment captured:", err);
  }
};

// Handle failed payment
const handlePaymentFailed = async (payment) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpay_order_id: payment.order_id },
      {
        razorpay_payment_id: payment.id,
        status: "failed",
        error: payment.error_description || payment.error_reason,
        failedAt: new Date(payment.created_at * 1000),
      }
    );
  } catch (err) {
    console.error("Error handling payment failed:", err);
  }
};

// Handle paid order
const handleOrderPaid = async (order) => {
  try {
    const payment = await Payment.findOne({ razorpay_order_id: order.id });
    
    if (payment && payment.status !== "paid") {
      // Create order if not already created
      const existingOrder = await Order.findOne({ payment: payment._id });
      
      if (!existingOrder) {
        const newOrder = new Order({
          user: payment.user,
          payment: payment._id,
          items: payment.items,
          totalAmount: payment.amount / 100,
          currency: payment.currency,
          status: "confirmed",
          shippingAddress: "",
          billingAddress: "",
        });

        await newOrder.save();

        // Update stock
        for (const item of payment.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }

        // Clear cart
        await Cart.findOneAndUpdate(
          { user: payment.user },
          {
            items: [],
            totalItems: 0,
            totalPrice: 0,
            totalSavings: 0,
          }
        );
      }
    }
  } catch (err) {
    console.error("Error handling order paid:", err);
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("payment")
      .populate("items.product", "title mainImages slug");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order details",
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title mainImages")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["confirmed", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: "Order cannot be cancelled at this stage",
      });
    }

    // Update order status
    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    // Refund process (initiate refund via Razorpay if needed)
    // You'll need to implement refund logic based on your policy

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to cancel order",
    });
  }
};

// Buy Now - Direct checkout without cart
export const buyNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, address, subtotal, delivery, total } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No products provided",
      });
    }

    // Validate and fetch product details
    const validatedItems = [];
    let calculatedAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId).populate('variants');

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product not found`,
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `${product.title} is out of stock`,
        });
      }

      calculatedAmount += item.price * item.quantity;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price,
        variant: item.variantId || null,
        variantDetails: null,
      });
    }

    // Calculate delivery fee
    const deliveryFee = calculatedAmount > 5000 ? 0 : 99;
    const totalAmount = calculatedAmount + deliveryFee;

    // Handle optional currency conversion (client may send target currency)
    const targetCurrency = req.body.currency || 'INR';
    let amountInSmallestUnit;
    let orderCurrency = 'INR';

    if (targetCurrency && targetCurrency !== 'INR') {
      try {
        const rates = await getRates('INR');
        const converted = convertAmount(totalAmount, rates, targetCurrency);
        if (converted == null) throw new Error('Conversion failed');
        amountInSmallestUnit = Math.round(converted * 100);
        orderCurrency = targetCurrency;
      } catch (err) {
        console.warn('Currency conversion failed for buyNow, falling back to INR', err.message || err);
        amountInSmallestUnit = Math.round(totalAmount * 100);
        orderCurrency = 'INR';
      }
    } else {
      amountInSmallestUnit = Math.round(totalAmount * 100);
    }

    if (amountInSmallestUnit < 100) {
      return res.status(400).json({
        success: false,
        error: "Minimum order amount is ₹1",
      });
    }

    // Create Razorpay order
    const options = {
      amount: amountInSmallestUnit,
      currency: orderCurrency,
      receipt: generateReceiptId(),
      payment_capture: 1,
      notes: {
        userId: userId.toString(),
        type: "buyNow",
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      user: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInSmallestUnit,
      currency: orderCurrency,
      status: "created",
      items: validatedItems,
      metadata: {
        deliveryFee: deliveryFee,
        subtotalAmount: calculatedAmount,
        totalAmount: totalAmount,
        shippingAddress: address,
        type: "buyNow",
      },
    });

    await payment.save();

    res.json({
      success: true,
      order: razorpayOrder,
      payment_id: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      delivery: deliveryFee,
    });

    console.log("✅ Buy Now order created successfully", {
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: orderCurrency,
      keyType: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + "..."
    });

  } catch (err) {
    console.error("Buy now error:", err);

    if (err.error && err.error.description) {
      return res.status(400).json({
        success: false,
        error: err.error.description,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create order. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};