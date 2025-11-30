import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Sends credentials to the API, stores token+user on success.
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const data = response.data;
      const accessToken = data.accessToken || data.token;
      const userData = data.user || data;

      if (!accessToken || !userData) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  // Registers a new user via the API and stores token+user on success.
  const register = async (email, password, name) => {
    try {
      const response = await authAPI.register(email, password, name);
      const data = response.data;
      const accessToken = data.accessToken || data.token;
      const userData = data.user || data;

      if (!accessToken || !userData) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  // Clears local auth state and token.
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
