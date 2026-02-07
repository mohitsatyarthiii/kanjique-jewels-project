import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <Navigate to="/admin" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return <Outlet />;
};

export default AdminProtectedRoute;
