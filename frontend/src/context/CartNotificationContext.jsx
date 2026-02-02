// context/CartNotificationContext.jsx
import React, { createContext, useState, useContext } from "react";
import CartNotification from "../components/addToCart/CartNotification";

const CartNotificationContext = createContext();

export const useCartNotification = () => {
  const context = useContext(CartNotificationContext);
  if (!context) {
    throw new Error("useCartNotification must be used within CartNotificationProvider");
  }
  return context;
};

export const CartNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (product, quantity = 1) => {
    setNotification({ product, quantity });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <CartNotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      {/* Cart Notification */}
      {notification && (
        <CartNotification
          product={notification.product}
          quantity={notification.quantity}
          onClose={hideNotification}
        />
      )}
    </CartNotificationContext.Provider>
  );
};