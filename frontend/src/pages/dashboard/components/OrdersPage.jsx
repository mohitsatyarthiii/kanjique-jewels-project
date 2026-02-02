import { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token, navigate]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">
                Order #{order._id.slice(-6)}
              </h2>
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-4 items-center border-b pb-2 mb-2">
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.product.title}</h3>
                    <p>₹{item.product.price}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              <p className="font-bold">Total: ₹{order.totalAmount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
