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
  console.error("❌ Razorpay credentials missing!");
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
    const { currency: targetCurrency = 'INR' } = req.body;

    // Populate cart with product details
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "title mainImages basePrice baseSalePrice variants stock slug category",
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
          error: `Product not found`,
        });
      }

      // Check stock
      if (product.totalStock < item.quantity) {
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

    // Get exchange rates
    const rates = await getRates('INR');
    
    // Determine amount in smallest unit for Razorpay
    let amountInSmallestUnit;
    let orderCurrency = targetCurrency;
    let exchangeRate = 1;
    let convertedAmount = totalAmount;

    if (targetCurrency && targetCurrency !== 'INR') {
      const converted = convertAmount(totalAmount, rates, targetCurrency);
      if (converted != null) {
        convertedAmount = converted;
        exchangeRate = rates[targetCurrency];
        
        // Handle different decimal places for currencies
        if (targetCurrency === 'JPY') {
          // JPY has 0 decimal places
          amountInSmallestUnit = Math.round(convertedAmount);
        } else {
          // Most currencies have 2 decimal places
          amountInSmallestUnit = Math.round(convertedAmount * 100);
        }
      } else {
        // Fallback to INR
        console.warn(`Conversion to ${targetCurrency} failed, falling back to INR`);
        orderCurrency = 'INR';
        amountInSmallestUnit = Math.round(totalAmount * 100);
        exchangeRate = 1;
      }
    } else {
      orderCurrency = 'INR';
      amountInSmallestUnit = Math.round(totalAmount * 100);
    }

    // Validate minimum amount
    const minAmountInTarget = orderCurrency === 'INR' ? 100 : 1; // Minimum 1 unit in target currency
    if (amountInSmallestUnit < minAmountInTarget) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount is ${orderCurrency === 'INR' ? '₹1' : '1 ' + orderCurrency}`,
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
        originalAmountINR: totalAmount.toString(),
        exchangeRate: exchangeRate.toString(),
      },
    };

    console.log("Creating Razorpay order with options:", {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record in DB
    const payment = new Payment({
      user: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInSmallestUnit,
      currency: orderCurrency,
      originalCurrency: 'INR',
      originalAmount: totalAmount,
      exchangeRate: exchangeRate,
      status: "created",
      items: validatedItems,
      metadata: {
        cartTotal: cart.totalPrice,
        totalItems: cart.totalItems,
        totalSavings: cart.totalSavings || 0,
        deliveryFee: deliveryFee,
        subtotalAmount: amount,
        totalAmount: totalAmount,
        type: "cart"
      },
    });

    await payment.save();

    res.json({
      success: true,
      order: razorpayOrder,
      payment_id: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      convertedAmount: convertedAmount,
      currency: orderCurrency,
      delivery: deliveryFee,
      exchangeRate: exchangeRate
    });

    console.log("✅ Order created successfully", {
      orderId: razorpayOrder.id,
      amountINR: totalAmount,
      amountConverted: convertedAmount,
      currency: orderCurrency,
      exchangeRate: exchangeRate
    });

  } catch (err) {
    console.error("❌ Create order error:", err);
    
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

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
      shippingAddress,
      currency,
      originalAmount
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: "Shipping address is required",
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
        error: "Payment verification failed - Invalid signature",
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
      subtotalAmount: payment.metadata.subtotalAmount,
      deliveryFee: payment.metadata.deliveryFee,
      discountAmount: payment.metadata.totalSavings || 0,
      totalAmount: payment.metadata.totalAmount,
      displayCurrency: payment.currency,
      displayAmount: payment.amount / (payment.currency === 'JPY' ? 1 : 100),
      status: "confirmed",
      shippingAddress: shippingAddress,
      billingAddress: shippingAddress,
      notes: req.body.notes || "",
    });

    await order.save();

    // Update product stock
    for (const item of payment.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { totalStock: -item.quantity } }
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

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        displayAmount: order.displayAmount,
        displayCurrency: order.displayCurrency,
        status: order.status,
      },
      payment: {
        id: payment._id,
        razorpay_payment_id: payment.razorpay_payment_id,
        status: payment.status,
      },
    });

  } catch (err) {
    console.error("❌ Verify payment error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};

// Buy Now - Direct checkout
export const buyNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, address, subtotal, delivery, total, currency: targetCurrency = 'INR' } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No products provided",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Shipping address is required",
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
      if (product.totalStock < item.quantity) {
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
        variantDetails: item.variantDetails || null,
      });
    }

    // Calculate delivery fee
    const deliveryFee = calculatedAmount > 5000 ? 0 : 99;
    const totalAmount = calculatedAmount + deliveryFee;

    // Get exchange rates
    const rates = await getRates('INR');
    
    // Determine amount in smallest unit for Razorpay
    let amountInSmallestUnit;
    let orderCurrency = targetCurrency;
    let exchangeRate = 1;
    let convertedAmount = totalAmount;

    if (targetCurrency && targetCurrency !== 'INR') {
      const converted = convertAmount(totalAmount, rates, targetCurrency);
      if (converted != null) {
        convertedAmount = converted;
        exchangeRate = rates[targetCurrency];
        
        if (targetCurrency === 'JPY') {
          amountInSmallestUnit = Math.round(convertedAmount);
        } else {
          amountInSmallestUnit = Math.round(convertedAmount * 100);
        }
      } else {
        orderCurrency = 'INR';
        amountInSmallestUnit = Math.round(totalAmount * 100);
        exchangeRate = 1;
      }
    } else {
      orderCurrency = 'INR';
      amountInSmallestUnit = Math.round(totalAmount * 100);
    }

    if (amountInSmallestUnit < (orderCurrency === 'INR' ? 100 : 1)) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount is ${orderCurrency === 'INR' ? '₹1' : '1 ' + orderCurrency}`,
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
        originalAmountINR: totalAmount.toString(),
        exchangeRate: exchangeRate.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      user: userId,
      razorpay_order_id: razorpayOrder.id,
      amount: amountInSmallestUnit,
      currency: orderCurrency,
      originalCurrency: 'INR',
      originalAmount: totalAmount,
      exchangeRate: exchangeRate,
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
      convertedAmount: convertedAmount,
      currency: orderCurrency,
      delivery: deliveryFee,
      exchangeRate: exchangeRate,
    });

    console.log("✅ Buy Now order created successfully", {
      orderId: razorpayOrder.id,
      amountINR: totalAmount,
      amountConverted: convertedAmount,
      currency: orderCurrency
    });

  } catch (err) {
    console.error("❌ Buy now error:", err);

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
    const { reason } = req.body;

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
    order.cancellationReason = reason || "Cancelled by customer";
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { totalStock: item.quantity } }
      );
    }

    // Update payment status
    await Payment.findByIdAndUpdate(order.payment, {
      status: "refunded"
    });

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

