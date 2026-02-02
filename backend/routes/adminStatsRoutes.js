import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

const router = express.Router();

// Check admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

// Get dashboard stats
router.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("📊 Fetching dashboard stats...");
    
    // Get all data in parallel
    const [
      totalRevenueResult,
      totalOrdersResult,
      totalProductsResult,
      totalUsersResult,
      recentPayments,
      allProducts
    ] = await Promise.all([
      // Total Revenue (from successful payments)
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // Total Orders (all payments)
      Payment.countDocuments(),
      
      // Total Products
      Product.countDocuments(),
      
      // Total Users
      User.countDocuments({ role: { $ne: "admin" } }), // Exclude admin users
      
      // Recent Orders (last 5 payments)
      Payment.find()
        .populate("user", "name email")
        .populate("items.product", "title price images")
        .sort({ createdAt: -1 })
        .limit(5),
      
      // All products for top products
      Product.find()
        .select("title price images category inStock")
        .sort({ price: -1 }) // Top by price (or you can sort by sales)
        .limit(8)
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const totalOrders = totalOrdersResult || 0;
    const totalProducts = totalProductsResult || 0;
    const totalUsers = totalUsersResult || 0;

    // Format recent orders
    const formattedRecentOrders = recentPayments.map(payment => ({
      _id: payment._id,
      orderId: payment.razorpay_order_id || `PAY-${payment._id.toString().slice(-8)}`,
      user: payment.user ? {
        name: payment.user.name,
        email: payment.user.email
      } : null,
      amount: payment.amount,
      status: payment.status,
      items: payment.items?.length || 0,
      createdAt: payment.createdAt
    }));

    // Format top products
    const formattedTopProducts = allProducts.map(product => ({
      _id: product._id,
      title: product.title,
      price: product.price,
      category: product.category,
      images: product.images,
      inStock: product.inStock || true
    }));

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue / 100, // Convert paise to rupees
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders: formattedRecentOrders,
        topProducts: formattedTopProducts
      }
    });

  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
});

// Get revenue stats (with date range)
router.get("/revenue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchCriteria = { status: "paid" };
    
    if (startDate && endDate) {
      matchCriteria.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const revenueStats = await Payment.aggregate([
      { $match: matchCriteria },
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$amount" }
        }
      }
    ]);

    const result = revenueStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };

    res.json({
      success: true,
      totalRevenue: result.totalRevenue / 100,
      totalOrders: result.totalOrders,
      averageOrderValue: result.averageOrderValue / 100
    });

  } catch (err) {
    console.error("Revenue stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get recent users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const users = await User.find({ role: { $ne: "admin" } })
      .select("name email createdAt lastLogin")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      users,
      total: await User.countDocuments({ role: { $ne: "admin" } })
    });

  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;