import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmacy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('[CartContext] Failed to persist cart:', err);
    }
  }, [cart]);

  // Add medicine to cart with stock constraint check
  const addToCart = (medicine, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.medicine._id === medicine._id);
      const requestedQty = Math.max(1, parseInt(quantity, 10));

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        const newQty = Math.min(medicine.stock, currentQty + requestedQty);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          medicine, // refresh latest price and details
        };
        return updated;
      } else {
        const safeQty = Math.min(medicine.stock, requestedQty);
        return [...prev, { medicine, quantity: safeQty }];
      }
    });
  };

  // Update specific item quantity
  const updateQuantity = (medicineId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.medicine._id === medicineId) {
          const maxAvailable = item.medicine.stock || 999;
          return {
            ...item,
            quantity: Math.min(maxAvailable, qty),
          };
        }
        return item;
      })
    );
  };

  // Remove specific item from cart
  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((item) => item.medicine._id !== medicineId));
  };

  // Clear all items in cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('pharmacy_cart');
  };

  // Computed values
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.medicine.price || 0) * item.quantity,
    0
  );

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
