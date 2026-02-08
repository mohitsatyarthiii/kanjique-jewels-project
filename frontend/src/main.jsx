import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./index.css";
import App from "./App";
import { CartProvider } from "./context/CartContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <BrowserRouter>
              <App/>
            </BrowserRouter>
          </CartProvider>
        </CurrencyProvider>
    </AuthProvider>
  </React.StrictMode>
);
