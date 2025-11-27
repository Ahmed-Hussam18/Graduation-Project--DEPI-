import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../utils/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCart = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const response = await cartAPI.getCart(user.id);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!user) return;
    try {
      const existingItem = cartItems.find(
        (item) => item.productId === product.id
      );
      if (existingItem) {
        // Optimistic update
        const updatedItems = cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setCartItems(updatedItems);

        await cartAPI.updateCart(existingItem.id, {
          quantity: existingItem.quantity + 1,
        });
      } else {
        // For new items we can't easily be optimistic because we need the ID from the server
        // But we can reload silently
        await cartAPI.addToCart({
          userId: user.id,
          productId: product.id,
          product: product,
          quantity: 1,
        });
        loadCart(true); // Silent reload
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      loadCart(true); // Revert on error
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (!user) return;

    // Store previous state for rollback
    const previousItems = [...cartItems];

    try {
      if (quantity <= 0) {
        await removeFromCart(id);
      } else {
        // Optimistic update
        setCartItems(prev => prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        ));

        await cartAPI.updateCart(id, { quantity });
        // No need to reload if successful, as local state is already updated
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setCartItems(previousItems); // Rollback
    }
  };

  const removeFromCart = async (id) => {
    if (!user) return;

    const previousItems = [...cartItems];

    try {
      // Optimistic update
      setCartItems(prev => prev.filter(item => item.id !== id));

      await cartAPI.removeFromCart(id);
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartItems(previousItems); // Rollback
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      setCartItems([]); // Optimistic clear
      await cartAPI.clearCart(user.id);
    } catch (error) {
      console.error('Error clearing cart:', error);
      loadCart(true); // Reload if failed
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

