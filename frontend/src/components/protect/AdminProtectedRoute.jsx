import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <div className="p-6">Access denied.</div>;

  return children;
}
