import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

const router = express.Router();

// Check admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false,
      error: "Access denied. Admin only." 
    });
  }
  next();
};

// Get dashboard stats
router.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log("📊 Fetching dashboard stats...");
    
    // Get all data in parallel for better performance
    const [
      totalRevenueResult,
      totalOrdersResult,
      totalProductsResult,
      totalUsersResult,
      recentPayments,
      topProducts
    ] = await Promise.all([
      // Total Revenue (from successful payments only)
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { 
          _id: null, 
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        } }
      ]),
      
      // Total Orders (all payments with different statuses)
      Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total Products with active status
      Product.aggregate([
        {
          $group: {
            _id: "$isActive",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total Users by role
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent Orders (last 10 payments with populated data)
      Payment.find()
        .populate("user", "name email")
        .populate({
          path: "items.product",
          select: "title mainImages basePrice baseSalePrice"
        })
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Top Products (featured and active)
      Product.find({ 
        isActive: true,
        isFeatured: true 
      })
        .select("title mainImages minPrice maxPrice category inStock totalStock")
        .sort({ createdAt: -1 })
        .limit(8)
    ]);

    // Calculate total revenue (convert paise to rupees)
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const totalPaidOrders = totalRevenueResult[0]?.count || 0;

    // Calculate total orders by status
    const totalOrders = {
      paid: 0,
      created: 0,
      failed: 0,
      total: 0
    };
    
    totalOrdersResult.forEach(stat => {
      totalOrders[stat._id] = stat.count;
      totalOrders.total += stat.count;
    });

    // Calculate products by status
    const totalProducts = {
      active: 0,
      inactive: 0,
      total: 0
    };
    
    totalProductsResult.forEach(stat => {
      if (stat._id === true) {
        totalProducts.active = stat.count;
      } else if (stat._id === false) {
        totalProducts.inactive = stat.count;
      }
      totalProducts.total += stat.count;
    });

    // Calculate users by role
    const totalUsers = {
      admin: 0,
      user: 0,
      total: 0
    };
    
    totalUsersResult.forEach(stat => {
      if (stat._id === "admin") {
        totalUsers.admin = stat.count;
      } else if (stat._id === "user") {
        totalUsers.user = stat.count;
      }
      totalUsers.total += stat.count;
    });

    // Format recent orders for frontend
    const formattedRecentOrders = recentPayments.map(payment => {
      // Calculate total amount from items if available
      let orderAmount = payment.amount / 100; // Convert paise to rupees
      
      // If amount is not available in payment, calculate from items
      if (!payment.amount && payment.items && payment.items.length > 0) {
        orderAmount = payment.items.reduce((sum, item) => {
          const price = item.product?.baseSalePrice || item.product?.basePrice || 0;
          return sum + (price * item.quantity);
        }, 0);
      }

      return {
        _id: payment._id,
        orderId: payment.razorpay_order_id || `ORD-${payment._id.toString().slice(-8).toUpperCase()}`,
        user: payment.user ? {
          _id: payment.user._id,
          name: payment.user.name,
          email: payment.user.email
        } : null,
        amount: orderAmount,
        status: payment.status || "created",
        itemsCount: payment.items?.length || 0,
        date: payment.createdAt,
        formattedDate: new Date(payment.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };
    });

    // Format top products for frontend
    const formattedTopProducts = topProducts.map(product => {
      const displayPrice = product.minPrice === product.maxPrice 
        ? product.minPrice 
        : `${product.minPrice} - ${product.maxPrice}`;
      
      return {
        _id: product._id,
        title: product.title,
        price: product.minPrice,
        priceRange: product.minPrice !== product.maxPrice ? 
          `${product.minPrice} - ${product.maxPrice}` : null,
        displayPrice: displayPrice,
        category: product.category,
        images: product.mainImages?.[0]?.url || null,
        inStock: product.inStock,
        stockQuantity: product.totalStock,
        isFeatured: product.isFeatured
      };
    });

    // Calculate additional stats
    const averageOrderValue = totalPaidOrders > 0 
      ? Math.round((totalRevenue / 100) / totalPaidOrders) 
      : 0;

    const conversionRate = totalOrders.total > 0 
      ? Math.round((totalPaidOrders / totalOrders.total) * 100) 
      : 0;

    res.json({
      success: true,
      stats: {
        // Main stats
        totalRevenue: totalRevenue / 100, // Convert paise to rupees
        totalOrders: totalOrders.total,
        totalProducts: totalProducts.total,
        totalUsers: totalUsers.user, // Only customer users
        
        // Detailed stats
        orderStats: {
          paid: totalOrders.paid,
          created: totalOrders.created,
          failed: totalOrders.failed,
          total: totalOrders.total
        },
        
        productStats: {
          active: totalProducts.active,
          inactive: totalProducts.inactive,
          total: totalProducts.total
        },
        
        userStats: {
          admin: totalUsers.admin,
          user: totalUsers.user,
          total: totalUsers.total
        },
        
        // Analytics
        averageOrderValue,
        conversionRate: `${conversionRate}%`,
        
        // Recent data
        recentOrders: formattedRecentOrders,
        topProducts: formattedTopProducts,
        
        // Metadata
        lastUpdated: new Date(),
        currency: "INR"
      }
    });

  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching dashboard stats",
      details: err.message 
    });
  }
});

// Get revenue stats with date range
router.get("/revenue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchCriteria = { status: "paid" };
    
    // Add date filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      
      matchCriteria.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    const revenueStats = await Payment.aggregate([
      { $match: matchCriteria },
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          minOrder: { $min: "$amount" },
          maxOrder: { $max: "$amount" }
        }
      }
    ]);

    const result = revenueStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      minOrder: 0,
      maxOrder: 0
    };

    const averageOrderValue = result.totalOrders > 0 
      ? Math.round(result.totalRevenue / result.totalOrders) 
      : 0;

    res.json({
      success: true,
      revenue: {
        totalRevenue: result.totalRevenue / 100, // Convert to rupees
        totalOrders: result.totalOrders,
        averageOrderValue: averageOrderValue / 100,
        minOrder: result.minOrder / 100,
        maxOrder: result.maxOrder / 100
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });

  } catch (err) {
    console.error("Revenue stats error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching revenue stats" 
    });
  }
});

// Get daily revenue for chart
router.get("/revenue/daily", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          revenue: { $divide: ["$revenue", 100] }, // Convert to rupees
          orders: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      dailyRevenue,
      days: parseInt(days)
    });

  } catch (err) {
    console.error("Daily revenue error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching daily revenue" 
    });
  }
});

// Get product stats
router.get("/products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalActive: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
          },
          totalFeatured: {
            $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] }
          },
          totalInStock: {
            $sum: { $cond: [{ $eq: ["$inStock", true] }, 1, 0] }
          },
          totalStockQuantity: { $sum: "$totalStock" },
          avgPrice: { $avg: "$basePrice" }
        }
      }
    ]);

    const result = productStats[0] || {
      totalProducts: 0,
      totalActive: 0,
      totalFeatured: 0,
      totalInStock: 0,
      totalStockQuantity: 0,
      avgPrice: 0
    };

    // Get products by category
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts: result.totalProducts,
        activeProducts: result.totalActive,
        featuredProducts: result.totalFeatured,
        inStockProducts: result.totalInStock,
        totalStock: result.totalStockQuantity,
        averagePrice: Math.round(result.avgPrice),
        outOfStockProducts: result.totalProducts - result.totalInStock
      },
      categories: categoryStats.map(cat => ({
        name: cat._id || "Uncategorized",
        count: cat.count
      }))
    });

  } catch (err) {
    console.error("Product stats error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching product stats" 
    });
  }
});

// Get user stats
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const [users, userStats] = await Promise.all([
      // Recent users
      User.find({ role: { $ne: "admin" } })
        .select("name email phone address createdAt lastLogin")
        .sort({ createdAt: -1 })
        .limit(limit),
      
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalAdmins: {
              $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] }
            },
            usersWithPhone: {
              $sum: { $cond: [{ $ifNull: ["$phone", false] }, 1, 0] }
            },
            usersWithAddress: {
              $sum: { $cond: [{ $ifNull: ["$address", false] }, 1, 0] }
            },
            newestUser: { $max: "$createdAt" },
            oldestUser: { $min: "$createdAt" }
          }
        }
      ])
    ]);

    const stats = userStats[0] || {
      totalUsers: 0,
      totalAdmins: 0,
      usersWithPhone: 0,
      usersWithAddress: 0
    };

    // Format recent users
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "Not provided",
      address: user.address ? "Yes" : "No",
      joinedDate: user.createdAt,
      formattedDate: new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"
    }));

    res.json({
      success: true,
      stats: {
        totalUsers: stats.totalUsers - stats.totalAdmins, // Only customers
        totalAdmins: stats.totalAdmins,
        usersWithPhone: stats.usersWithPhone,
        usersWithAddress: stats.usersWithAddress,
        phonePercentage: Math.round((stats.usersWithPhone / stats.totalUsers) * 100) || 0
      },
      recentUsers: formattedUsers,
      total: stats.totalUsers
    });

  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching user stats" 
    });
  }
});

// Get order stats
router.get("/orders", requireAuth, requireAdmin, async (req, res) => {
  try {
    const orderStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
          },
          failedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "created"] }, 1, 0] }
          },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" }
        }
      }
    ]);

    const result = orderStats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      paidOrders: 0,
      failedOrders: 0,
      pendingOrders: 0,
      minAmount: 0,
      maxAmount: 0
    };

    // Get monthly orders
    const monthlyOrders = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders: result.totalOrders,
        totalRevenue: result.totalAmount / 100,
        paidOrders: result.paidOrders,
        failedOrders: result.failedOrders,
        pendingOrders: result.pendingOrders,
        successRate: Math.round((result.paidOrders / result.totalOrders) * 100) || 0,
        averageOrderValue: result.totalOrders > 0 
          ? Math.round((result.totalAmount / result.totalOrders) / 100) 
          : 0,
        minOrder: result.minAmount / 100,
        maxOrder: result.maxAmount / 100
      },
      monthlyStats: monthlyOrders.map(month => ({
        month: month._id.month,
        year: month._id.year,
        orders: month.orders,
        revenue: month.revenue / 100
      }))
    });

  } catch (err) {
    console.error("Order stats error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error fetching order stats" 
    });
  }
});

export default router;