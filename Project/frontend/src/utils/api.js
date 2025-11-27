import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://back-end-jp7u.onrender.com"
    : "http://localhost:3001");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email, password, name) =>
    api.post("/register", { email, password, name }),
  login: (email, password) => api.post("/login", { email, password }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  updateProduct: (id, product) => api.patch(`/products/${id}`, product),
};

export const cartAPI = {
  getCart: (userId) => api.get(`/carts?userId=${userId}`),
  addToCart: (item) => api.post("/carts", item),
  updateCart: (id, item) => api.patch(`/carts/${id}`, item),
  removeFromCart: (id) => api.delete(`/carts/${id}`),
  clearCart: (userId) => {
    return api.get(`/carts?userId=${userId}`).then((response) => {
      const items = response.data;
      return Promise.all(items.map((item) => api.delete(`/carts/${item.id}`)));
    });
  },
};

export const favouritesAPI = {
  getFavourites: (userId) => api.get(`/favourites?userId=${userId}`),
  addToFavourites: (item) => api.post("/favourites", item),
  removeFromFavourites: (id) => api.delete(`/favourites/${id}`),
  isFavourite: (userId, productId) =>
    api.get(`/favourites?userId=${userId}&productId=${productId}`),
};

export const ordersAPI = {
  getOrders: (userId) => api.get(`/orders?userId=${userId}`),
  createOrder: (order) => api.post("/orders", order),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, order) => api.patch(`/orders/${id}`, order),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}`, { status: "cancelled" }),
};

export const reviewsAPI = {
  getReviews: (productId) => api.get(`/reviews?productId=${productId}`),
  createReview: (review) => api.post("/reviews", review),
  updateReview: (id, review) => api.patch(`/reviews/${id}`, review),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getUserReview: (userId, productId) =>
    api.get(`/reviews?userId=${userId}&productId=${productId}`),
};

export const userAPI = {
  updateUser: (id, userData) => api.patch(`/users/${id}`, userData),
  getUser: (id) => api.get(`/users/${id}`),
};

export default api;
