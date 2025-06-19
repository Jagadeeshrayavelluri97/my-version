import axios from "axios";
import { toast } from "react-toastify";
import { showToast } from "./toast";

// Set base URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://pg-management-system-api.onrender.com");

// Make sure the API URL doesn't have a trailing slash
const formattedApiUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
const apiBasePath = "/api/v1";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${formattedApiUrl}${apiBasePath}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Debug info
console.log("API URL:", api.defaults.baseURL);
console.log("Environment:", import.meta.env.MODE);
console.log("Sample full URL:", `${api.defaults.baseURL}/admin/login`);

// Global flag to track if we're currently refreshing the page
// This helps prevent redirect loops during page refresh
if (typeof window !== "undefined") {
  window.isPageRefreshing = window.isPageRefreshing || false;

  // Set the flag to true when the page is refreshing
  window.addEventListener("beforeunload", () => {
    window.isPageRefreshing = true;
    // Store this in sessionStorage so it persists across the refresh
    sessionStorage.setItem("isRefreshing", "true");
  });

  // Check if we're coming from a refresh
  if (sessionStorage.getItem("isRefreshing") === "true") {
    window.isPageRefreshing = true;
    // Clear the flag after a short delay
    setTimeout(() => {
      window.isPageRefreshing = false;
      sessionStorage.removeItem("isRefreshing");
    }, 2000);
  }
}

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // config.headers.Authorization = `Bearer ${token}`;/
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // Temporarily disable page reload to debug blinking issue
      // window.location.href = '/login';
      console.error("401 Unauthorized: Session expired or invalid token. Automatic redirect disabled for debugging.");
      // You might want to show a toast message here instead:
      // showToast('Session expired. Please log in again.', { type: 'error' });
    }
    return Promise.reject(error);
  }
);

// API calls for rooms, tenants, and rents

// Room API calls
export const getRooms = async (params = {}) => {
  try {
    console.log("Fetching rooms with params:", params);
    const response = await api.get("/rooms", { params });
    return response;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

export const getRoom = async (id) => {
  try {
    console.log("Fetching room with id:", id);
    const response = await api.get(`/rooms/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    throw error;
  }
};

export const createRoom = async (roomData) => {
  try {
    console.log("Creating room with data:", roomData);
    const response = await api.post("/rooms", roomData);
    showToast("Room created successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error("Error creating room:", error);
    showToast(error.response?.data?.error || "Failed to create room", {
      type: "error",
    });
    throw error;
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    console.log("Updating room with id:", id, "data:", roomData);
    const response = await api.put(`/rooms/${id}`, roomData);
    showToast("Room updated successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error(`Error updating room ${id}:`, error);
    showToast(error.response?.data?.error || "Failed to update room", {
      type: "error",
    });
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
    console.log("Deleting room with id:", id);
    const response = await api.delete(`/rooms/${id}`);
    showToast("Room deleted successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error(`Error deleting room ${id}:`, error);
    showToast(error.response?.data?.error || "Failed to delete room", {
      type: "error",
    });
    throw error;
  }
};

// Tenant API calls
export const getTenants = async (params = {}) => {
  try {
    console.log("Fetching tenants with params:", params);
    const response = await api.get("/tenants", { params });
    return response;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
};

export const getTenant = async (id) => {
  try {
    console.log("Fetching tenant with id:", id);
    const response = await api.get(`/tenants/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching tenant ${id}:`, error);
    throw error;
  }
};

export const createTenant = async (tenantData) => {
  try {
    console.log("Creating tenant with data:", tenantData);
    const response = await api.post("/tenants", tenantData);
    showToast("Tenant created successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error("Error creating tenant:", error);
    showToast(error.response?.data?.error || "Failed to create tenant", {
      type: "error",
    });
    throw error;
  }
};

export const updateTenant = async (id, tenantData) => {
  try {
    console.log("Updating tenant with id:", id, "data:", tenantData);
    const response = await api.put(`/tenants/${id}`, tenantData);
    showToast("Tenant updated successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error(`Error updating tenant ${id}:`, error);
    showToast(error.response?.data?.error || "Failed to update tenant", {
      type: "error",
    });
    throw error;
  }
};

export const deleteTenant = async (id) => {
  try {
    console.log("Deleting tenant with id:", id);
    const response = await api.delete(`/tenants/${id}`);
    showToast("Tenant deleted successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error(`Error deleting tenant ${id}:`, error);
    showToast(error.response?.data?.error || "Failed to delete tenant", {
      type: "error",
    });
    throw error;
  }
};

// Rent API calls
export const getRents = async (params = {}) => {
  try {
    console.log("Fetching rents with params:", params);
    const response = await api.get("/rents", { params });
    return response;
  } catch (error) {
    console.error("Error fetching rents:", error);
    throw error;
  }
};

export const getRent = async (id) => {
  try {
    console.log("Fetching rent with id:", id);
    const response = await api.get(`/rents/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching rent ${id}:`, error);
    throw error;
  }
};

export const createRent = async (rentData) => {
  try {
    console.log("Creating rent with data:", rentData);
    const response = await api.post("/rents", rentData);
    showToast("Rent record created successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error("Error creating rent record:", error);
    showToast(error.response?.data?.error || "Failed to create rent record", {
      type: "error",
    });
    throw error;
  }
};

export const updateRent = async (id, rentData) => {
  try {
    console.log("Updating rent with id:", id, "data:", rentData);
    const response = await api.put(`/rents/${id}`, rentData);
    showToast("Rent record updated successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error(`Error updating rent ${id}:`, error);
    showToast(error.response?.data?.error || "Failed to update rent record", {
      type: "error",
    });
    throw error;
  }
};

export const deleteRent = async (id) => {
  try {
    console.log("Deleting rent with id:", id);
    const response = await api.delete(`/rents/${id}`);
    showToast("Rent record deleted successfully", { type: "success" });
    return response;
  } catch (error) {
    console.error(`Error deleting rent ${id}:`, error);
    showToast(error.response?.data?.error || "Failed to delete rent record", {
      type: "error",
    });
    throw error;
  }
};

// Dashboard API calls
export const getDashboardStats = async () => {
  try {
    console.log("Fetching dashboard stats...");
    const response = await api.get("/dashboard/stats");
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Export axios as the default export
export default api;
