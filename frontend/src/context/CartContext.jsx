import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/axiosInstance';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/api/cart');
      setCart(res.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const value = {
    cart,
    loading,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};