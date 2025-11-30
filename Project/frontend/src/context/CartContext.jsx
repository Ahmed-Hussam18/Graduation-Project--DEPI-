import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartAPI } from "../utils/api";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
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

  // Fetches cart items for the current user. `silent` avoids toggling the loading state.
  const loadCart = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const response = await cartAPI.getCart(user.id);
      setCartItems(response.data);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Adds a product to the cart. If item exists, increments quantity (optimistic update).
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
        await cartAPI.addToCart({
          userId: user.id,
          productId: product.id,
          product: product,
          quantity: 1,
        });
        loadCart(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      loadCart(true);
    }
  };

  // Updates quantity for a cart item; removes item when quantity <= 0.
  const updateQuantity = async (id, quantity) => {
    if (!user) return;

    const previousItems = [...cartItems];

    try {
      if (quantity <= 0) {
        await removeFromCart(id);
      } else {
        setCartItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );

        await cartAPI.updateCart(id, { quantity });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setCartItems(previousItems);
    }
  };

  // Removes an item from the cart and attempts server deletion.
  const removeFromCart = async (id) => {
    if (!user) return;

    const previousItems = [...cartItems];

    try {
      setCartItems((prev) => prev.filter((item) => item.id !== id));

      await cartAPI.removeFromCart(id);
    } catch (error) {
      console.error("Error removing from cart:", error);
      setCartItems(previousItems);
    }
  };

  // Clears all items for the current user's cart on server and locally.
  const clearCart = async () => {
    if (!user) return;
    try {
      setCartItems([]);
      await cartAPI.clearCart(user.id);
    } catch (error) {
      console.error("Error clearing cart:", error);
      loadCart(true);
    }
  };

  // Computes total cart price from items and quantities.
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
