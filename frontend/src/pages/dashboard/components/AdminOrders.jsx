import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../../utils/axiosInstance";
import {
  FiSearch,
  FiFilter,
  FiShoppingBag,
  FiCalendar,
  FiUser,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDollarSign,
  FiRefreshCw,
  FiEye
} from "react-icons/fi";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Admin ke liye alag endpoint hai
      const res = await api.get("/api/admin/orders");
      setOrders(res.data.orders || res.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Agar admin endpoint nahi hai to regular orders endpoint try karein
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching from regular endpoint:", err);
        alert("Failed to load orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(search.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <FiClock className="w-3 h-3" />,
        text: 'Pending'
      },
      processing: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <FiPackage className="w-3 h-3" />,
        text: 'Processing'
      },
      shipped: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <FiTruck className="w-3 h-3" />,
        text: 'Shipped'
      },
      delivered: { 
        color: 'bg-green-100 text-green-800', 
        icon: <FiCheckCircle className="w-3 h-3" />,
        text: 'Delivered'
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800', 
        icon: <FiXCircle className="w-3 h-3" />,
        text: 'Cancelled'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon && <span className="mr-1.5">{config.icon}</span>}
        {config.text}
      </span>
    );
  };

  // Calculate stats
  const getStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  };

  const stats = getStats();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Dashboard</h1>
            <p className="text-gray-600">View all customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiTruck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b2965a]"></div>
            <p className="text-gray-500 mt-2">Loading orders...</p>
          </div>
        ) : currentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">No orders found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.orderId || `ORD-${order._id.slice(-8).toUpperCase()}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {order._id.slice(-6)}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.user ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {order.user.name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.user.name || 'Customer'}</p>
                            <p className="text-sm text-gray-600">{order.user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Guest Customer</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            • {item.product?.title || 'Product'} × {item.quantity || 1}
                          </p>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-400">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#b2965a] text-lg">
                          ₹{(order.totalAmount || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.paymentMethod ? `Paid via ${order.paymentMethod}` : 'COD'}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status || 'pending')}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-600">
            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-[#b2965a] text-white'
                      : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;