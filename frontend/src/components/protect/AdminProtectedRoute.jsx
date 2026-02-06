import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/admin" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return <Outlet />;
};

export default AdminProtectedRoute;
