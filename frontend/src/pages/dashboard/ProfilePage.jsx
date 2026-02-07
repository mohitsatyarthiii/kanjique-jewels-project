import React, { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiShield,
  FiCheckCircle,
  FiPackage,
  FiClock
} from "react-icons/fi";
import { 
  Sparkles,
  Crown,
  Gem,
  Shield,
  CreditCard,
  Truck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    joinDate: "",
    membershipLevel: "Gold",
    totalOrders: 12,
    totalSpent: 1850000
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile");
        const userData = res.data.user;
        
        // Calculate membership level based on spending
        let membership = "Silver";
        if (userData.totalSpent >= 1000000) membership = "Gold";
        if (userData.totalSpent >= 5000000) membership = "Platinum";
        if (userData.totalSpent >= 10000000) membership = "Diamond";
        
        setUser({
          ...userData,
          membershipLevel: membership,
          joinDate: userData.joinDate || new Date().toISOString().split('T')[0]
        });

        // Fetch recent orders (user-specific)
        const ordersRes = await api.get("/api/user/orders");
        setRecentOrders(ordersRes.data.orders || []);
        
      } catch (err) {
        console.error("Profile fetch error:", err);
        showNotification("Unable to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/api/profile", {
        name: user.name,
        mobile: user.mobile,
        address: user.address,
      });
      showNotification("Profile updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.error || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Re-fetch original data
    const fetchOriginal = async () => {
      const res = await api.get("/api/profile");
      setUser(res.data.user);
    };
    fetchOriginal();
  };

  const showNotification = (message, type = "info") => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-[#b2965a] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-[#d4b97d]/30 rounded-full"></div>
            <Gem className="w-12 h-12 text-[#b2965a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Loading Your Profile</h3>
          <p className="text-gray-600">Preparing your exclusive account...</p>
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
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Exclusive Account</span>
            <span className="w-6 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
                Your Profile
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Manage your personal information, view orders, and access exclusive member benefits
              </p>
            </div>
            
            {/* Membership Badge */}
            <div className="bg-gradient-to-r from-[#b2965a]/10 to-[#d4b97d]/10 backdrop-blur-sm border border-[#f4e6c3] rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Crown className="w-8 h-8 text-[#b2965a]" />
                  <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#b2965a] uppercase tracking-wider">{user.membershipLevel} Member</div>
                  <div className="text-sm text-gray-700">Since {new Date(user.joinDate).getFullYear()}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] p-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full border-4 border-[#fef8e9] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#b2965a]" />
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] rounded-full">
                    <FiCheckCircle className="w-3 h-3 text-[#b2965a]" />
                    <span className="text-xs font-medium text-[#b2965a]">Verified Account</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-white to-[#fef8e9] border border-[#f4e6c3] rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.totalOrders}</div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                  <div className="bg-gradient-to-br from-white to-[#fef8e9] border border-[#f4e6c3] rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">₹{(user.totalSpent / 100000).toFixed(1)}L</div>
                    <div className="text-xs text-gray-600">Spent</div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isEditing
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
                      : "bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white hover:from-[#8c703f] hover:to-[#b2965a] hover:shadow-lg"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiX className="w-4 h-4" />
                      Cancel Editing
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#b2965a]" />
                Member Benefits
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fef8e9] to-white rounded-lg">
                  <Sparkles className="w-4 h-4 text-[#b2965a]" />
                  <div className="text-sm">Priority Customer Support</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fef8e9] to-white rounded-lg">
                  <Truck className="w-4 h-4 text-[#b2965a]" />
                  <div className="text-sm">Free Express Shipping</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fef8e9] to-white rounded-lg">
                  <Gem className="w-4 h-4 text-[#b2965a]" />
                  <div className="text-sm">Exclusive Previews</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fef8e9] to-white rounded-lg">
                  <CreditCard className="w-4 h-4 text-[#b2965a]" />
                  <div className="text-sm">Special Financing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex border-b border-[#f4e6c3] mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === "profile" ? "text-[#b2965a] border-b-2 border-[#b2965a]" : "text-gray-600 hover:text-[#b2965a]"}`}
              >
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Personal Info
                </div>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === "orders" ? "text-[#b2965a] border-b-2 border-[#b2965a]" : "text-gray-600 hover:text-[#b2965a]"}`}
              >
                <div className="flex items-center gap-2">
                  <FiPackage className="w-4 h-4" />
                  Recent Orders
                </div>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-6 py-3 font-medium text-sm transition-all ${activeTab === "security" ? "text-[#b2965a] border-b-2 border-[#b2965a]" : "text-gray-600 hover:text-[#b2965a]"}`}
              >
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Security
                </div>
              </button>
            </div>

            {/* Profile Form */}
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] p-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiUser className="w-4 h-4 text-[#b2965a]" />
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={user.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 pl-10 rounded-xl border transition-all duration-300 ${
                            isEditing 
                              ? "border-[#d4b97d] focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] bg-white" 
                              : "border-[#f4e6c3] bg-[#fef8e9]/50"
                          }`}
                        />
                        <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? "text-[#b2965a]" : "text-gray-400"}`} />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiMail className="w-4 h-4 text-[#b2965a]" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-[#f4e6c3] bg-[#fef8e9]/50 text-gray-600"
                        />
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiPhone className="w-4 h-4 text-[#b2965a]" />
                        Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="mobile"
                          value={user.mobile}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 pl-10 rounded-xl border transition-all duration-300 ${
                            isEditing 
                              ? "border-[#d4b97d] focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] bg-white" 
                              : "border-[#f4e6c3] bg-[#fef8e9]/50"
                          }`}
                          placeholder="+91 98765 43210"
                        />
                        <FiPhone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? "text-[#b2965a]" : "text-gray-400"}`} />
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FiClock className="w-4 h-4 text-[#b2965a]" />
                        Member Since
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={new Date(user.joinDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          disabled
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-[#f4e6c3] bg-[#fef8e9]/50 text-gray-600"
                        />
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 mb-8">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FiMapPin className="w-4 h-4 text-[#b2965a]" />
                      Delivery Address
                    </label>
                    <textarea
                      name="address"
                      value={user.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 resize-none ${
                        isEditing 
                          ? "border-[#d4b97d] focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] bg-white" 
                          : "border-[#f4e6c3] bg-[#fef8e9]/50"
                      }`}
                      placeholder="Enter your complete delivery address"
                    />
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 rounded-xl border border-[#b2965a] text-[#b2965a] font-medium hover:bg-[#fef8e9] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white font-medium hover:from-[#8c703f] hover:to-[#b2965a] transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order._id} className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-[#b2965a]">Order #{order.orderId}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            ₹{order.totalAmount?.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="border-t border-[#f4e6c3] pt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3]">
                              <img
                                src={order.items?.[0]?.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80"}
                                alt={order.items?.[0]?.product?.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.items?.[0]?.product?.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#fef8e9] to-[#f4e6c3] rounded-full flex items-center justify-center">
                        <FiPackage className="w-10 h-10 text-[#b2965a]" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
                      <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                      <button
                        onClick={() => window.location.href = "/products"}
                        className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl shadow-xl border border-[#f4e6c3] p-8"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] rounded-xl flex items-center justify-center">
                      <FiShield className="w-6 h-6 text-[#b2965a]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
                      <p className="text-gray-600">Manage your account security settings</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fef8e9] to-white rounded-xl border border-[#f4e6c3]">
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Password</div>
                        <div className="text-sm text-gray-600">Last changed 30 days ago</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg border border-[#b2965a] text-[#b2965a] text-sm font-medium hover:bg-[#fef8e9] transition-colors">
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fef8e9] to-white rounded-xl border border-[#f4e6c3]">
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-600">Add an extra layer of security</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white text-sm font-medium hover:from-[#8c703f] hover:to-[#b2965a] transition-all">
                        Enable
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fef8e9] to-white rounded-xl border border-[#f4e6c3]">
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Login Sessions</div>
                        <div className="text-sm text-gray-600">Manage active sessions</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg border border-[#b2965a] text-[#b2965a] text-sm font-medium hover:bg-[#fef8e9] transition-colors">
                        View All
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gradient-to-r from-[#fef8e9]/50 to-[#f4e6c3]/50 rounded-xl border border-[#f4e6c3]">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#b2965a] mt-0.5" />
                      <div>
                        <div className="font-medium text-[#8c703f] mb-1">Security Tips</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Use a strong, unique password</li>
                          <li>• Enable two-factor authentication</li>
                          <li>• Never share your login credentials</li>
                          <li>• Log out from shared devices</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}