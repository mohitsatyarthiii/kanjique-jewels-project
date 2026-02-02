import React from 'react';
import AdminSidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 transition-all duration-300">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;