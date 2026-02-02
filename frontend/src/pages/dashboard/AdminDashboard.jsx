import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import api from '../../utils/axiosInstance';
import {
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiCreditCard,
  FiTrendingUp,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  UserCheck,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      console.log("📊 Fetching dashboard data...");
      
      // ✅ Use the new stats endpoint
      const dashboardRes = await api.get('/api/admin/stats/dashboard');
      console.log("📈 Dashboard response:", dashboardRes.data);
      
      if (dashboardRes.data.success && dashboardRes.data.stats) {
        const data = dashboardRes.data.stats;
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalProducts: data.totalProducts || 0,
          totalUsers: data.totalUsers || 0,
          recentOrders: data.recentOrders || [],
          topProducts: data.topProducts || []
        });
      } else {
        // Fallback to individual API calls
        await fetchDataIndividually();
      }
      
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      console.error('Error response:', error.response?.data);
      
      // Fallback to individual API calls
      await fetchDataIndividually();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback function
  const fetchDataIndividually = async () => {
    try {
      console.log("🔄 Falling back to individual API calls...");
      
      const [revenueRes, ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats/revenue').catch(() => ({ data: { totalRevenue: 0 } })),
        api.get('/api/admin/orders?limit=10').catch(() => ({ data: { orders: [], count: 0 } })),
        api.get('/api/products?limit=10').catch(() => ({ data: { products: [] } })),
        api.get('/api/admin/stats/users?limit=5').catch(() => ({ data: { users: [], total: 0 } }))
      ]);

      // Get recent orders from admin orders endpoint
      const recentOrders = ordersRes.data.orders?.slice(0, 5) || [];
      
      // Calculate total revenue from recent orders
      const totalRevenue = recentOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || order.amount || 0);
      }, 0);

      setStats({
        totalRevenue,
        totalOrders: ordersRes.data.count || recentOrders.length,
        totalProducts: productsRes.data.products?.length || 0,
        totalUsers: usersRes.data.total || 0,
        recentOrders: recentOrders,
        topProducts: productsRes.data.products?.slice(0, 4) || []
      });
      
    } catch (fallbackError) {
      console.error("❌ Fallback fetch error:", fallbackError);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Get percentage change (demo data - real data ke liye backend se compare karna padega)
  const getPercentageChange = (current, previous = current * 0.85) => {
    if (previous === 0) return 0;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10; // 1 decimal place
  };

  // Demo previous values (real app mein database se last month/week ka data lena hoga)
  const demoPrevious = {
    revenue: stats.totalRevenue * 0.85,
    orders: Math.floor(stats.totalOrders * 0.92),
    products: Math.floor(stats.totalProducts * 0.95),
    users: Math.floor(stats.totalUsers * 0.90)
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      trend: `${getPercentageChange(stats.totalRevenue, demoPrevious.revenue)}%`,
      trendUp: getPercentageChange(stats.totalRevenue, demoPrevious.revenue) >= 0
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      trend: `${getPercentageChange(stats.totalOrders, demoPrevious.orders)}%`,
      trendUp: getPercentageChange(stats.totalOrders, demoPrevious.orders) >= 0
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <FiPackage className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-600',
      trend: `${getPercentageChange(stats.totalProducts, demoPrevious.products)}%`,
      trendUp: getPercentageChange(stats.totalProducts, demoPrevious.products) >= 0
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-600',
      trend: `${getPercentageChange(stats.totalUsers, demoPrevious.users)}%`,
      trendUp: getPercentageChange(stats.totalUsers, demoPrevious.users) >= 0
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#b2965a] text-white rounded-lg hover:bg-[#a0854a] transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FiRefreshCw className="w-4 h-4" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {/* Data Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span className="font-medium">📊 Data Source:</span>
            <span>Payments table • Products table • Users table</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trendUp ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <FiCalendar className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id || order.orderId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">
                      {order.orderId || `Order-${order._id?.slice(-8)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.user?.name || 'Customer'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{(order.amount ? order.amount / 100 : order.totalAmount || 0).toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'paid' || order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' || order.paymentStatus === 'created' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status || order.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent orders found</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => window.location.href = '/admin/orders'}
            className="w-full mt-6 py-2 text-[#b2965a] font-medium hover:bg-gray-50 rounded-lg border border-[#f4e6c3]"
          >
            View All Orders
          </button>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <FiTrendingUp className="text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/48'} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-sm text-gray-600 capitalize">{product.category || 'Jewellery'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{(product.price || 0).toLocaleString()}</p>
                    <p className={`text-xs px-2 py-1 rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiPackage className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => window.location.href = '/admin/products'}
            className="w-full mt-6 py-2 text-[#b2965a] font-medium hover:bg-gray-50 rounded-lg border border-[#f4e6c3]"
          >
            View All Products
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/products/new'}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center"
          >
            <FiPackage className="w-6 h-6 text-[#b2965a] mx-auto mb-2" />
            <span className="font-medium text-gray-900">Add Product</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin/orders'}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center"
          >
            <FiShoppingBag className="w-6 h-6 text-[#b2965a] mx-auto mb-2" />
            <span className="font-medium text-gray-900">View Orders</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin/users'}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center"
          >
            <FiUsers className="w-6 h-6 text-[#b2965a] mx-auto mb-2" />
            <span className="font-medium text-gray-900">Manage Users</span>
          </button>
          <button 
            onClick={() => window.location.href = '/admin/reports'}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center"
          >
            <FiCreditCard className="w-6 h-6 text-[#b2965a] mx-auto mb-2" />
            <span className="font-medium text-gray-900">Payment Reports</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;