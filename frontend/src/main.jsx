import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
