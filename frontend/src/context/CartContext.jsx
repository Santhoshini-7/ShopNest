import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi, wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await cartApi.get();
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await wishlistApi.get();
      if (res.data?.success) {
        setWishlist(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to your cart');
    }
    try {
      const res = await cartApi.add(productId, quantity);
      if (res.data?.success) {
        setCart(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add to cart';
      throw new Error(msg);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartApi.updateQuantity(itemId, quantity);
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update quantity';
      throw new Error(msg);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartApi.remove(itemId);
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove item';
      throw new Error(msg);
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to save to wishlist');
    }
    try {
      const res = await wishlistApi.add(productId);
      if (res.data?.success) {
        await fetchWishlist();
        return res.data.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add to wishlist';
      throw new Error(msg);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistApi.remove(productId);
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove from wishlist';
      throw new Error(msg);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.product?.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
