import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { favouritesAPI } from "../utils/api";

const FavouritesContext = createContext(null);

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error("useFavourites must be used within FavouritesProvider");
  }
  return context;
};

export const FavouritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);
  const favouritesRef = useRef(favourites);

  useEffect(() => {
    favouritesRef.current = favourites;
  }, [favourites]);

  useEffect(() => {
    if (user) {
      loadFavourites();
    } else {
      setFavourites([]);
    }
  }, [user]);

  const loadFavourites = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const response = await favouritesAPI.getFavourites(user.id);
      setFavourites(response.data);
    } catch (error) {
      console.error("Error loading favourites:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addToFavourites = async (product) => {
    if (!user) return;

    if (favourites.some((item) => item.productId === product.id)) {
      return;
    }

    const tempId = Date.now();
    const optimisticItem = {
      id: tempId,
      userId: user.id,
      productId: product.id,
      product: product,
      isTemp: true,
    };

    setFavourites((prev) => [...prev, optimisticItem]);

    try {
      const response = await favouritesAPI.addToFavourites({
        userId: user.id,
        productId: product.id,
        product: product,
      });

      const newItem = response.data;

      if (!favouritesRef.current.some((item) => item.id === tempId)) {
        await favouritesAPI.removeFromFavourites(newItem.id);
        return;
      }

      setFavourites((prev) =>
        prev.map((item) => (item.id === tempId ? newItem : item))
      );
    } catch (error) {
      console.error("Error adding to favourites:", error);
      setFavourites((prev) => prev.filter((item) => item.id !== tempId));
    }
  };

  const removeFromFavourites = async (id) => {
    if (!user) return;

    const previousFavourites = [...favourites];
    const itemToRemove = favourites.find((item) => item.id === id);

    if (!itemToRemove) return;

    setFavourites((prev) => prev.filter((item) => item.id !== id));

    if (itemToRemove.isTemp) {
      return;
    }

    try {
      await favouritesAPI.removeFromFavourites(id);
    } catch (error) {
      console.error("Error removing from favourites:", error);
      setFavourites(previousFavourites);
    }
  };

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        addToFavourites,
        removeFromFavourites,
        loading,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};
