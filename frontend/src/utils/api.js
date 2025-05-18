import axios from "axios";
import { toast } from "react-toastify";

// Set base URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://pg-management-system-api.onrender.com");

// Make sure the API URL doesn't have a trailing slash
const formattedApiUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
const apiBasePath = "/api/v1";
axios.defaults.baseURL = `${formattedApiUrl}${apiBasePath}`;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.timeout = 15000; // 15 seconds timeout

// Debug info
console.log("API URL:", axios.defaults.baseURL);
console.log("Environment:", import.meta.env.MODE);
console.log("Sample full URL:", `${axios.defaults.baseURL}/admin/login`);

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add to headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // If not on login or register page, clear token and redirect
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        toast.error("Session expired. Please login again.");
      }
    }

    return Promise.reject(error);
  }
);

// API calls for rooms, tenants, and rents

// Room API calls
export const getRooms = async (params = {}) => {
  try {
    console.log("Fetching rooms with params:", params);
    const response = await axios.get("/rooms", { params });
    return response;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

export const getRoom = async (id) => {
  try {
    console.log("Fetching room with id:", id);
    const response = await axios.get(`/rooms/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    throw error;
  }
};

export const createRoom = async (roomData) => {
  try {
    console.log("Creating room with data:", roomData);
    const response = await axios.post("/rooms", roomData);
    toast.success("Room created successfully");
    return response;
  } catch (error) {
    console.error("Error creating room:", error);
    toast.error(error.response?.data?.error || "Failed to create room");
    throw error;
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    console.log("Updating room with id:", id, "data:", roomData);
    const response = await axios.put(`/rooms/${id}`, roomData);
    toast.success("Room updated successfully");
    return response;
  } catch (error) {
    console.error(`Error updating room ${id}:`, error);
    toast.error(error.response?.data?.error || "Failed to update room");
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
    console.log("Deleting room with id:", id);
    const response = await axios.delete(`/rooms/${id}`);
    toast.success("Room deleted successfully");
    return response;
  } catch (error) {
    console.error(`Error deleting room ${id}:`, error);
    toast.error(error.response?.data?.error || "Failed to delete room");
    throw error;
  }
};

// Tenant API calls
export const getTenants = async (params = {}) => {
  try {
    console.log("Fetching tenants with params:", params);
    const response = await axios.get("/tenants", { params });
    return response;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
};

export const getTenant = async (id) => {
  try {
    console.log("Fetching tenant with id:", id);
    const response = await axios.get(`/tenants/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching tenant ${id}:`, error);
    throw error;
  }
};

export const createTenant = async (tenantData) => {
  try {
    console.log("Creating tenant with data:", tenantData);
    const response = await axios.post("/tenants", tenantData);
    toast.success("Tenant created successfully");
    return response;
  } catch (error) {
    console.error("Error creating tenant:", error);
    toast.error(error.response?.data?.error || "Failed to create tenant");
    throw error;
  }
};

export const updateTenant = async (id, tenantData) => {
  try {
    console.log("Updating tenant with id:", id, "data:", tenantData);
    const response = await axios.put(`/tenants/${id}`, tenantData);
    toast.success("Tenant updated successfully");
    return response;
  } catch (error) {
    console.error(`Error updating tenant ${id}:`, error);
    toast.error(error.response?.data?.error || "Failed to update tenant");
    throw error;
  }
};

export const deleteTenant = async (id) => {
  try {
    console.log("Deleting tenant with id:", id);
    const response = await axios.delete(`/tenants/${id}`);
    toast.success("Tenant deleted successfully");
    return response;
  } catch (error) {
    console.error(`Error deleting tenant ${id}:`, error);
    toast.error(error.response?.data?.error || "Failed to delete tenant");
    throw error;
  }
};

// Rent API calls
export const getRents = async (params = {}) => {
  try {
    console.log("Fetching rents with params:", params);
    const response = await axios.get("/rents", { params });
    return response;
  } catch (error) {
    console.error("Error fetching rents:", error);
    throw error;
  }
};

export const getRent = async (id) => {
  try {
    console.log("Fetching rent with id:", id);
    const response = await axios.get(`/rents/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching rent ${id}:`, error);
    throw error;
  }
};

export const createRent = async (rentData) => {
  try {
    console.log("Creating rent with data:", rentData);
    const response = await axios.post("/rents", rentData);
    toast.success("Rent record created successfully");
    return response;
  } catch (error) {
    console.error("Error creating rent record:", error);
    toast.error(error.response?.data?.error || "Failed to create rent record");
    throw error;
  }
};

export const updateRent = async (id, rentData) => {
  try {
    console.log("Updating rent with id:", id, "data:", rentData);
    const response = await axios.put(`/rents/${id}`, rentData);
    toast.success("Rent record updated successfully");
    return response;
  } catch (error) {
    console.error(`Error updating rent ${id}:`, error);
    toast.error(error.response?.data?.error || "Failed to update rent record");
    throw error;
  }
};

export const deleteRent = async (id) => {
  try {
    console.log("Deleting rent with id:", id);
    const response = await axios.delete(`/rents/${id}`);
    toast.success("Rent record deleted successfully");
    return response;
  } catch (error) {
    console.error(`Error deleting rent ${id}:`, error);
    toast.error(error.response?.data?.error || "Failed to delete rent record");
    throw error;
  }
};

// Dashboard API calls
export const getDashboardStats = async () => {
  try {
    console.log("Fetching dashboard stats...");
    const response = await axios.get("/dashboard/stats");
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Export axios as the default export
export default axios;
