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
axios.defaults.baseURL = `${formattedApiUrl}${apiBasePath}`;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.timeout = 15000; // 15 seconds timeout

// Debug info
console.log("API URL:", axios.defaults.baseURL);
console.log("Environment:", import.meta.env.MODE);
console.log("Sample full URL:", `${axios.defaults.baseURL}/admin/login`);

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
      // Check if we're currently refreshing the page
      // If so, don't redirect or clear tokens yet
      if (window.isPageRefreshing) {
        console.log("Page is refreshing, not redirecting for 401 error");
        return Promise.reject(error);
      }

      // Check if we've already handled a 401 error recently to prevent multiple redirects
      const lastAuthErrorTime = localStorage.getItem("lastAuthErrorTime");
      const currentTime = new Date().getTime();

      // Only handle the error if it's been more than 3 seconds since the last one
      // or if there's no record of a previous error
      if (
        !lastAuthErrorTime ||
        currentTime - parseInt(lastAuthErrorTime) > 3000
      ) {
        localStorage.setItem("lastAuthErrorTime", currentTime.toString());

        // If not on login or register page, clear token and redirect
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          // Check if we have a token before clearing
          const hasToken = localStorage.getItem("token");

          if (!hasToken) {
            console.log("No token found, skipping logout process");
            return Promise.reject(error);
          }

          // Clear auth data
          localStorage.removeItem("token");
          localStorage.removeItem("adminData");
          localStorage.removeItem("tokenTimestamp");

          // Use the current location to pass to showToast
          const currentLocation = { pathname: window.location.pathname };

          // Show toast before redirect to ensure it's seen
          showToast(
            "Session expired. Please login again.",
            { type: "error" },
            currentLocation
          );

          // Small delay before redirect to allow toast to be shown
          setTimeout(() => {
            window.location.href = "/login";
          }, 500);
        } else if (window.location.pathname.includes("/login")) {
          // If on login page, use the location object for proper handling
          const loginLocation = { pathname: "/login" };
          showToast("Please login first", { type: "info" }, loginLocation);
        }
      } else {
        console.log("Ignoring duplicate 401 error");
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
    const response = await axios.put(`/rooms/${id}`, roomData);
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
    const response = await axios.delete(`/rooms/${id}`);
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
    const response = await axios.put(`/tenants/${id}`, tenantData);
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
    const response = await axios.delete(`/tenants/${id}`);
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
    const response = await axios.put(`/rents/${id}`, rentData);
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
    const response = await axios.delete(`/rents/${id}`);
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
    const response = await axios.get("/dashboard/stats");
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Export axios as the default export
export default axios;
