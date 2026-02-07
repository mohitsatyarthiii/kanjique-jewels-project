import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import api from '../../utils/axiosInstance';
import {
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  Settings,
  Plus,
  BarChart3,
  Bell,
  Search,
  Home,
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Get admin profile
      const profileRes = await api.get('/api/profile');
      setAdminName(profileRes.data.user?.name || 'Admin');
      
      // Try to get stats if endpoint exists
      try {
        const statsRes = await api.get('/api/admin/stats/dashboard');
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
      } catch (statsErr) {
        console.log('Stats endpoint not available, using placeholders');
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: 'Add New Product',
      description: 'Create new jewelry listings',
      icon: <Plus className="w-6 h-6 text-[#b2965a]" />,
      link: '/admin/products/new',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      title: 'Manage Products',
      description: 'View and edit all products',
      icon: <Package className="w-6 h-6 text-[#b2965a]" />,
      link: '/admin/products',
      color: 'bg-gradient-to-br from-emerald-50 to-emerald-100'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: <ShoppingBag className="w-6 h-6 text-[#b2965a]" />,
      link: '/admin/orders',
      color: 'bg-gradient-to-br from-amber-50 to-amber-100'
    },
    {
      title: 'Customer Management',
      description: 'View all registered users',
      icon: <Users className="w-6 h-6 text-[#b2965a]" />,
      link: '/admin/users',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100'
    },
    {
      title: 'Payment Reports',
      description: 'View payment transactions',
      icon: <CreditCard className="w-6 h-6 text-[#b2965a]" />,
      link: '/admin/payments',
      color: 'bg-gradient-to-br from-rose-50 to-rose-100'
    },
    {
      title: 'Reports & Analytics',
      description: 'View sales analytics',
      icon: <BarChart3 className="w-6 h-6 text-[#b2965a]" />,
      link: '/admin/reports',
      color: 'bg-gradient-to-br from-cyan-50 to-cyan-100'
    }
  ];

  const adminLinks = [
    {
      title: 'Website Home',
      description: 'Visit the main store',
      icon: <Home className="w-5 h-5" />,
      link: '/',
      external: true
    },
    {
      title: 'Profile Settings',
      description: 'Update admin profile',
      icon: <User className="w-5 h-5" />,
      link: '/admin/profile'
    },
    {
      title: 'Store Settings',
      description: 'Configure store settings',
      icon: <Settings className="w-5 h-5" />,
      link: '/admin/settings'
    },
    {
      title: 'Logout',
      description: 'Sign out from admin panel',
      icon: <LogOut className="w-5 h-5" />,
      link: '/logout',
      action: 'logout'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-[#f4e6c3] rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-8 h-8 text-[#b2965a]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Preparing your admin panel...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
              <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">
                Admin Dashboard
              </span>
              <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-[#b2965a]">{adminName}</span> 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your jewelry store efficiently from one place
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f4e6c3] focus:border-[#b2965a]"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#b2965a]" />
          Store Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border-2 border-[#f4e6c3] p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-lg">
                <Package className="w-6 h-6 text-[#b2965a]" />
              </div>
              <span className="text-sm font-medium text-gray-500">Products</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalProducts || 0}
            </h3>
            <p className="text-gray-600">Total jewelry items in store</p>
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="mt-4 text-sm font-medium text-[#b2965a] hover:text-[#9c8146]"
            >
              View all →
            </button>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border-2 border-[#f4e6c3] p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-lg">
                <ShoppingBag className="w-6 h-6 text-[#b2965a]" />
              </div>
              <span className="text-sm font-medium text-gray-500">Orders</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalOrders || 0}
            </h3>
            <p className="text-gray-600">Total customer orders</p>
            <button 
              onClick={() => window.location.href = '/admin/orders'}
              className="mt-4 text-sm font-medium text-[#b2965a] hover:text-[#9c8146]"
            >
              Manage orders →
            </button>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border-2 border-[#f4e6c3] p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-lg">
                <Users className="w-6 h-6 text-[#b2965a]" />
              </div>
              <span className="text-sm font-medium text-gray-500">Customers</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalUsers || 0}
            </h3>
            <p className="text-gray-600">Registered customers</p>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="mt-4 text-sm font-medium text-[#b2965a] hover:text-[#9c8146]"
            >
              View customers →
            </button>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-xl border-2 border-[#f4e6c3] p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-lg">
                <CreditCard className="w-6 h-6 text-[#b2965a]" />
              </div>
              <span className="text-sm font-medium text-gray-500">Revenue</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              ₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
            </h3>
            <p className="text-gray-600">Total revenue generated</p>
            <button 
              onClick={() => window.location.href = '/admin/payments'}
              className="mt-4 text-sm font-medium text-[#b2965a] hover:text-[#9c8146]"
            >
              View reports →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#b2965a]" />
            Quick Actions
          </h2>
          <span className="text-sm text-gray-500">Click any card to navigate</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => window.location.href = link.link}
              className={`${link.color} rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  {link.icon}
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-white rounded-full">
                    New
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {link.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {link.description}
              </p>
              <div className="flex items-center text-[#b2965a] font-medium group-hover:gap-2 transition-all">
                <span>Get started</span>
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Tools */}
      <div className="bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#b2965a]" />
          Admin Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => {
                if (link.action === 'logout') {
                  // Handle logout
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                } else if (link.external) {
                  window.open(link.link, '_blank');
                } else {
                  window.location.href = link.link;
                }
              }}
              className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#fef8e9] transition-colors">
                  {link.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Welcome Message */}
      <div className="mt-10 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold mb-3">Need Help?</h2>
            <p className="mb-4">
              Having trouble with the dashboard? Check our documentation or contact support for assistance.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-[#b2965a] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                View Documentation
              </button>
              <button className="bg-transparent border-2 border-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-5xl font-bold mb-2">24/7</div>
            <p className="text-white/80">Support Available</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;