import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../../utils/axiosInstance";
import {
  FiSearch,
  FiFilter,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiDownload
} from "react-icons/fi";
import { User, Shield, Crown, Clock, TrendingUp } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "orders":
        return (b.orderCount || 0) - (a.orderCount || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await api.put(`/api/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, isActive: res.data.user.isActive } : user
      ));
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => user._id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user._id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert("Please select users first.");
      return;
    }

    if (action === "delete") {
      if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) return;
      
      try {
        await api.post("/api/admin/users/bulk-delete", { userIds: selectedUsers });
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user._id)));
        setSelectedUsers([]);
      } catch (error) {
        console.error("Bulk delete error:", error);
      }
    } else if (action === "activate") {
      try {
        await api.post("/api/admin/users/bulk-activate", { userIds: selectedUsers });
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user._id) ? { ...user, isActive: true } : user
        ));
        setSelectedUsers([]);
      } catch (error) {
        console.error("Bulk activate error:", error);
      }
    } else if (action === "deactivate") {
      try {
        await api.post("/api/admin/users/bulk-deactivate", { userIds: selectedUsers });
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user._id) ? { ...user, isActive: false } : user
        ));
        setSelectedUsers([]);
      } catch (error) {
        console.error("Bulk deactivate error:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? (
        <>
          <FiCheck className="w-3 h-3 mr-1" /> Active
        </>
      ) : (
        <>
          <FiX className="w-3 h-3 mr-1" /> Inactive
        </>
      )}
    </span>
  );

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', icon: <Crown className="w-3 h-3" /> },
      user: { color: 'bg-blue-100 text-blue-800', icon: <User className="w-3 h-3" /> },
      vip: { color: 'bg-yellow-100 text-yellow-800', icon: <Shield className="w-3 h-3" /> }
    };

    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon && <span className="mr-1">{config.icon}</span>}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage all registered users and their accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white rounded-lg hover:shadow-lg transition-shadow">
              <FiDownload className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% from last month
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {((users.filter(u => u.isActive).length / users.length) * 100 || 0).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => {
                    const userDate = new Date(u.createdAt);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return userDate > monthAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">Customers</option>
              <option value="admin">Admins</option>
              <option value="vip">VIP Users</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="orders">Most Orders</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-900">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <FiCheck /> Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center gap-2"
                >
                  <FiX /> Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                >
                  <FiTrash2 /> Delete
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b2965a]"></div>
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserX className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">No users found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-[#b2965a] rounded focus:ring-[#b2965a]"
                      />
                      <span className="ml-2">User</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <tr 
                    key={user._id} 
                    className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(user._id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="h-4 w-4 text-[#b2965a] rounded focus:ring-[#b2965a]"
                        />
                        <div className="flex items-center gap-3 ml-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'No Name'}</p>
                            <p className="text-sm text-gray-500">ID: {user._id.slice(-8)}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <FiPhone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>{getRoleBadge(user.role || 'user')}</div>
                        <div>{getStatusBadge(user.isActive !== false)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{user.orderCount || 0}</span>
                          <span className="text-gray-600"> orders</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-[#b2965a]">₹{user.totalSpent?.toLocaleString() || '0'}</span>
                          <span className="text-gray-600"> spent</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last login: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          title="View Details"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit User"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user._id, user.isActive !== false)}
                          title={user.isActive !== false ? "Deactivate User" : "Activate User"}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive !== false 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {user.isActive !== false ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
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
      {sortedUsers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-600">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, sortedUsers.length)} of{" "}
            {sortedUsers.length} users
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

export default AdminUsers;