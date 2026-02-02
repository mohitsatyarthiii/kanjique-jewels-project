import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import {Order} from "../models/Order.js";


// create new product
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, brand, images, inStock } = req.body;
    if (!title || !price || !category)
      return res.status(400).json({ error: "Title, price, and category are required" });

    const slug = title.toLowerCase().replace(/ /g, "-"); // simple slug
    const product = await Product.create({
      title,
      slug,
      description,
      price,
      category,
      brand,
      images: images || [],
      inStock: inStock !== undefined ? inStock : true,
      createdBy: req.user._id,
    });

    res.json({ ok: true, product });
  } catch (err) {
    console.error("createProduct error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// optional: get all products (admin view)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ ok: true, products });
  } catch (err) {
    console.error("getAllProducts error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
  try {
    // Agar auth middleware se req.user.role check karna hai
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    // Optional: Agar population chahiye to
    const users = await User.find()
      .select("-password -__v") // Password exclude karein
      .sort({ createdAt: -1 });

    // Agar order count aur total spent calculate karna hai
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id });
        const orderCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        return {
          ...user.toObject(),
          orderCount,
          totalSpent
        };
      })
    );

    res.json({ 
      ok: true, 
      users: usersWithStats,
      count: usersWithStats.length
    });
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single user details
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select("-password -__v")
      .populate({
        path: 'orders',
        select: 'orderId totalAmount status createdAt',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user stats
    const orders = await Order.find({ user: id });
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      ok: true,
      user: {
        ...user.toObject(),
        orderCount,
        totalSpent,
        avgOrderValue: orderCount > 0 ? totalSpent / orderCount : 0
      }
    });
  } catch (err) {
    console.error("getUserById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user status (active/inactive)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Khud ko deactivate nahi kar sakte
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot change your own status" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      ok: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user 
    });
  } catch (err) {
    console.error("updateUserStatus error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'vip'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Khud ka role change nahi kar sakte
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      ok: true, 
      message: `User role updated to ${role}`,
      user 
    });
  } catch (err) {
    console.error("updateUserRole error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Khud ko delete nahi kar sakte
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optional: Check if user has orders before deleting
    const userOrders = await Order.find({ user: id });
    if (userOrders.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete user with existing orders. Deactivate instead." 
      });
    }

    await User.findByIdAndDelete(id);
    
    res.json({ 
      ok: true, 
      message: "User deleted successfully" 
    });
  } catch (err) {
    console.error("deleteUser error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    // Khud ko bulk delete se remove karein
    const filteredIds = userIds.filter(id => id !== req.user._id.toString());
    
    // Users with orders check karein
    const usersWithOrders = await Order.find({ 
      user: { $in: filteredIds } 
    }).distinct('user');

    const deletableIds = filteredIds.filter(id => 
      !usersWithOrders.includes(id)
    );

    if (deletableIds.length === 0) {
      return res.status(400).json({ 
        error: "Selected users have orders or no valid users to delete" 
      });
    }

    const result = await User.deleteMany({ 
      _id: { $in: deletableIds } 
    });

    res.json({ 
      ok: true, 
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("bulkDeleteUsers error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Bulk activate users
export const bulkActivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { isActive: true },
      { multi: true }
    );

    res.json({ 
      ok: true, 
      message: `${result.modifiedCount} users activated`,
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("bulkActivateUsers error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Bulk deactivate users
export const bulkDeactivateUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    // Khud ko exclude karein
    const filteredIds = userIds.filter(id => id !== req.user._id.toString());

    const result = await User.updateMany(
      { _id: { $in: filteredIds } },
      { isActive: false },
      { multi: true }
    );

    res.json({ 
      ok: true, 
      message: `${result.modifiedCount} users deactivated`,
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("bulkDeactivateUsers error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user statistics for dashboard
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Last 30 days ke new users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Monthly growth
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousMonthUsers = await User.countDocuments({
      createdAt: { 
        $gte: sixtyDaysAgo, 
        $lt: thirtyDaysAgo 
      }
    });

    const growthRate = previousMonthUsers > 0 
      ? ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)
      : "N/A";

    res.json({
      ok: true,
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsersThisMonth,
        growthRate,
        activePercentage: ((activeUsers / totalUsers) * 100).toFixed(1)
      }
    });
  } catch (err) {
    console.error("getUserStats error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};