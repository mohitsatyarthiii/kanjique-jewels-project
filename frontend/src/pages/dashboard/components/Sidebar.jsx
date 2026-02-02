import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiLayout,
  FiPackage,
  FiUsers,
  FiShoppingBag,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi';
import { Gem } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiLayout /> },
    { path: '/admin/products', label: 'Products', icon: <FiPackage /> },
    { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
    { path: '/admin/orders', label: 'Orders', icon: <FiShoppingBag /> },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        shadow-xl z-40 transform transition-transform duration-300
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-lg flex items-center justify-center">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kanjique</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-[#b2965a] to-[#d4b97d] text-white shadow-lg' 
                  : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Stats */}
        <div className="p-4 mt-8 border-t border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Admin Status</span>
              <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">Online</span>
            </div>
            <div className="text-xs text-gray-500">
              Last login: Today 10:30 AM
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-900/20 text-red-300 hover:text-red-200 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;