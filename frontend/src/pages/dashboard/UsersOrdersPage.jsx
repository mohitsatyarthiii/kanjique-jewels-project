import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext"; // ✅ Auth context import karo
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock,
  FiShoppingBag,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiCreditCard,
  FiMapPin
} from "react-icons/fi";
import { 
  Truck, 
  Package, 
  CreditCard, 
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  ShoppingBag,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersOrdersPage() {
  const { user } = useAuth(); // ✅ Auth context se user data lo
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      console.log("📦 Fetching user orders...");
      
      // ✅ Correct endpoint for user orders
      const res = await api.get("/api/user/orders");
      console.log("✅ Orders response:", res.data);
      
      if (res.data.success && res.data.orders) {
        setOrders(res.data.orders);
      } else {
        // Alternative endpoint try karo
        try {
          const altRes = await api.get("/api/payments/my-payments");
          setOrders(altRes.data.payments || []);
        } catch (altErr) {
          console.error("Alternative endpoint error:", altErr);
          throw new Error("Failed to fetch orders");
        }
      }
      
    } catch (err) {
      console.error("❌ Orders fetch error:", err);
      showNotification(
        err.response?.data?.error || "Failed to load orders",
        "error"
      );
      
      // Demo data agar API fail ho (remove in production)
      if (process.env.NODE_ENV === "development") {
        setOrders(getDemoOrders());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusConfig = (status, paymentStatus) => {
    // Use paymentStatus if available, else use status
    const actualStatus = paymentStatus || status;
    
    const configs = {
      'paid': {
        color: 'from-green-500 to-emerald-600',
        text: 'Payment Confirmed',
        icon: <FiCheckCircle className="w-4 h-4" />,
        bg: 'bg-green-50',
        textColor: 'text-green-700',
        progress: 25,
        nextStep: 'Processing'
      },
      'processing': {
        color: 'from-blue-500 to-cyan-600',
        text: 'Processing Order',
        icon: <FiRefreshCw className="w-4 h-4" />,
        bg: 'bg-blue-50',
        textColor: 'text-blue-700',
        progress: 50,
        nextStep: 'Shipping'
      },
      'shipped': {
        color: 'from-purple-500 to-violet-600',
        text: 'Shipped',
        icon: <Truck className="w-4 h-4" />,
        bg: 'bg-purple-50',
        textColor: 'text-purple-700',
        progress: 75,
        nextStep: 'Delivery'
      },
      'delivered': {
        color: 'from-emerald-500 to-teal-600',
        text: 'Delivered',
        icon: <Package className="w-4 h-4" />,
        bg: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        progress: 100,
        nextStep: 'Completed'
      },
      'created': {
        color: 'from-yellow-500 to-amber-600',
        text: 'Payment Pending',
        icon: <Clock className="w-4 h-4" />,
        bg: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        progress: 10,
        nextStep: 'Payment'
      },
      'failed': {
        color: 'from-red-500 to-rose-600',
        text: 'Payment Failed',
        icon: <AlertCircle className="w-4 h-4" />,
        bg: 'bg-red-50',
        textColor: 'text-red-700',
        progress: 0,
        nextStep: 'Retry Payment'
      },
      'cancelled': {
        color: 'from-gray-500 to-gray-600',
        text: 'Cancelled',
        icon: '✕',
        bg: 'bg-gray-50',
        textColor: 'text-gray-700',
        progress: 0,
        nextStep: 'None'
      }
    };
    
    return configs[actualStatus] || configs.created;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        const status = order.paymentStatus || order.status;
        return status === filter;
      });

  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-6 right-6 p-4 rounded-xl shadow-2xl text-white z-50 transform transition-all duration-300 animate-fade-in ${
      type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : 
      type === "error" ? "bg-gradient-to-r from-red-500 to-rose-600" : 
      "bg-gradient-to-r from-blue-500 to-indigo-600"
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          ${type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
        </div>
        <div>
          <p class="font-semibold">${message}</p>
          <p class="text-xs opacity-90">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
  };

  // Demo data for development (remove in production)
  const getDemoOrders = () => {
    return [
      {
        _id: "order_001",
        orderId: "PAY-12345678",
        amount: 250000, // 2500 rupees in paise
        totalAmount: 2500,
        status: "processing",
        paymentStatus: "paid",
        razorpay_payment_id: "pay_123456",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: [
          {
            product: {
              title: "Diamond Solitaire Ring",
              price: 2500,
              images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80"]
            },
            quantity: 1,
            price: 2500
          }
        ]
      },
      {
        _id: "order_002",
        orderId: "PAY-87654321",
        amount: 150000, // 1500 rupees in paise
        totalAmount: 1500,
        status: "delivered",
        paymentStatus: "paid",
        razorpay_payment_id: "pay_654321",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        items: [
          {
            product: {
              title: "Gold Chain Necklace",
              price: 1500,
              images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80"]
            },
            quantity: 1,
            price: 1500
          }
        ]
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-[#d4b97d]/30 rounded-full"></div>
            <FiPackage className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Loading Your Orders</h3>
          <p className="text-gray-600">Fetching your purchase history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
            <FiUser className="w-16 h-16 text-[#b2965a]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to login to view your orders</p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <FiUser className="w-5 h-5" />
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/40 to-[#d4b97d]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/30 to-[#b2965a]/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="w-full h-full bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
                <FiShoppingBag className="w-16 h-16 text-[#b2965a]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full border-4 border-[#fef8e9] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#b2965a]" />
              </div>
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              No Orders Yet
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Your order history will appear here once you make a purchase
            </p>
            
            <div className="space-y-6">
              <button
                onClick={() => window.location.href = "/products"}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:from-[#8c703f] hover:to-[#b2965a] hover:shadow-xl transition-all duration-300"
              >
                <FiShoppingBag className="w-5 h-5" />
                Start Shopping
              </button>
              
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#b2965a] transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Orders'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/40 to-[#d4b97d]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/30 to-[#b2965a]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-6 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Purchase History</span>
            <span className="w-6 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600">
                Track, manage, and review all your purchases
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#b2965a]/10 to-[#d4b97d]/10 backdrop-blur-sm border border-[#f4e6c3] rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center">
                    <FiPackage className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</div>
                    <div className="text-xl font-bold text-gray-900">{orders.length}</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#b2965a] text-[#b2965a] hover:bg-[#fef8e9] transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "all" 
                  ? "bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white" 
                  : "bg-white border border-[#f4e6c3] text-gray-700 hover:bg-[#fef8e9]"
              }`}
            >
              All Orders ({orders.length})
            </button>
            {['paid', 'processing', 'created', 'failed', 'cancelled'].map((status) => {
              const count = orders.filter(o => {
                const orderStatus = o.paymentStatus || o.status;
                return orderStatus === status;
              }).length;
              
              if (count === 0) return null;
              
              const config = getStatusConfig(status, status);
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    filter === status 
                      ? `${config.bg} ${config.textColor}` 
                      : "bg-white border border-[#f4e6c3] text-gray-700 hover:bg-[#fef8e9]"
                  }`}
                >
                  <span>{config.icon}</span>
                  {config.text} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status, order.paymentStatus);
              const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
              const orderTotal = order.totalAmount || (order.amount ? order.amount / 100 : 0);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-[#f4e6c3]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-xl flex items-center justify-center">
                          <FiPackage className="w-6 h-6 text-[#b2965a]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {order.orderId || `Order #${order._id.slice(-8).toUpperCase()}`}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.textColor}`}>
                              {statusConfig.icon}
                              {statusConfig.text}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {orderDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCreditCard className="w-3 h-3" />
                              <span>₹{orderTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#b2965a] text-[#b2965a] hover:bg-[#fef8e9] transition-colors text-sm font-medium"
                        >
                          {expandedOrder === order._id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white hover:from-[#8c703f] hover:to-[#b2965a] transition-all text-sm font-medium">
                          <FiDownload className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Order Placed</span>
                        <span>Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${statusConfig.color}`}
                          style={{ width: `${statusConfig.progress}%` }}
                        ></div>
                      </div>
                      {statusConfig.nextStep && (
                        <div className="text-xs text-gray-600 mt-2 text-center">
                          Next step: {statusConfig.nextStep}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items - Collapsible */}
                  <AnimatePresence>
                    {expandedOrder === order._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-b border-[#f4e6c3]">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Order Items ({order.items?.length || 0})
                          </h4>
                          
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                              {order.items.map((item, idx) => {
                                const product = item.product || {};
                                const itemTotal = (item.price || 0) * (item.quantity || 1);
                                
                                return (
                                  <div key={item._id || idx} className="flex gap-4 p-4 bg-gradient-to-r from-[#fef8e9] to-white rounded-xl border border-[#f4e6c3]">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] flex-shrink-0">
                                      {product.images?.[0] ? (
                                        <img
                                          src={product.images[0]}
                                          alt={product.title}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80";
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#b2965a] to-[#d4b97d] flex items-center justify-center">
                                          <Package className="w-8 h-8 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                        <div>
                                          <h5 className="font-medium text-gray-900 line-clamp-2">
                                            {product.title || "Unnamed Product"}
                                          </h5>
                                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                              <DollarSign className="w-3 h-3" />
                                              ₹{(item.price || 0).toLocaleString()}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>Quantity: {item.quantity || 1}</span>
                                            {product.category && (
                                              <>
                                                <span className="text-gray-300">•</span>
                                                <span className="capitalize">{product.category}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="text-right">
                                          <div className="text-lg font-bold text-gray-900">
                                            ₹{itemTotal.toLocaleString()}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Item total
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                              <p>No item details available</p>
                            </div>
                          )}
                        </div>

                        {/* Payment & Order Summary */}
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Payment Info */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Payment Information
                              </h4>
                              <div className="space-y-3">
                                <div className="p-4 bg-gradient-to-r from-[#fef8e9] to-white rounded-xl border border-[#f4e6c3]">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Status:</span>
                                      <span className={`font-medium ${statusConfig.textColor}`}>
                                        {statusConfig.text}
                                      </span>
                                    </div>
                                    {order.razorpay_payment_id && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Payment ID:</span>
                                        <span className="font-mono text-sm">
                                          {order.razorpay_payment_id.slice(-8)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Method:</span>
                                      <span className="font-medium">Razorpay</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Order Date:</span>
                                      <span className="font-medium">
                                        {orderDate.toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Order Summary
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span className="font-medium">₹{orderTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Shipping</span>
                                  <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tax (18%)</span>
                                  <span className="font-medium">₹{Math.round(orderTotal * 0.18).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-[#f4e6c3] pt-2 mt-2">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-[#b2965a]">
                                      ₹{(orderTotal * 1.18).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span>Secured payment via Razorpay</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Order Footer */}
                  <div className="p-6 bg-gradient-to-r from-[#fef8e9] to-white border-t border-[#f4e6c3]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4" />
                          <span>Need help with this order?</span>
                        </div>
                        <button className="text-[#b2965a] font-medium hover:text-[#8c703f] transition-colors text-sm">
                          Contact Customer Support
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Order Total</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{(orderTotal * 1.18).toLocaleString()}
                          </div>
                        </div>
                        
                        {order.paymentStatus === 'paid' && (
                          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-medium hover:from-[#8c703f] hover:to-[#b2965a] transition-all">
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty Filter State */}
        {filteredOrders.length === 0 && orders.length > 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
              <FiPackage className="w-12 h-12 text-[#b2965a]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
            <p className="text-gray-600 mb-6">No orders match the selected filter</p>
            <button
              onClick={() => setFilter("all")}
              className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              View All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}