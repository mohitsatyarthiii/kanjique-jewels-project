import React from "react";
import { useLocation } from "react-router-dom";

export default function SuccessPage() {
  const params = new URLSearchParams(useLocation().search);
  const payment_id = params.get("payment_id");
  const order_id = params.get("order_id");

  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Payment Successful</h1>
      <p>Payment ID: {payment_id}</p>
      <p>Order ID: {order_id}</p>
      <p>Thank you for your purchase!</p>
    </div>
  );
}
