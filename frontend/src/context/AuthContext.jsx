import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useLocation } from "react-router-dom";
import { showToast } from "../utils/toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Function to check if we're currently refreshing the page
  const isPageRefreshing = () => {
    return (
      window.isPageRefreshing ||
      sessionStorage.getItem("isRefreshing") === "true"
    );
  };

  useEffect(() => {
    // Check if user is logged in using localStorage and validate token
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminData = localStorage.getItem("adminData");
        const tokenTimestamp = localStorage.getItem("tokenTimestamp");
        const currentTime = new Date().getTime();

        // If we're refreshing the page, set auth state immediately without validation
        if (isPageRefreshing() && token && adminData) {
          console.log(
            "Page is refreshing, setting auth state without validation"
          );

          // Set the token in the API headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Parse the admin data
          const parsedAdminData = JSON.parse(adminData);

          // Set authentication state immediately
          setAdmin(parsedAdminData);
          setIsAuthenticated(true);
          setLoading(false);

          // Schedule a background validation after a delay
          setTimeout(() => {
            validateToken(token, parsedAdminData);
          }, 2000);

          return;
        }

        // If we have a token and admin data
        if (token && adminData) {
          // Set the token in the API headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Parse the admin data
          const parsedAdminData = JSON.parse(adminData);

          // Set authentication state immediately to prevent flashing login screen
          setAdmin(parsedAdminData);
          setIsAuthenticated(true);

          // Only validate the token if it's been more than 30 minutes since the last validation
          // or if there's no timestamp (first login)
          if (
            !tokenTimestamp ||
            currentTime - parseInt(tokenTimestamp) > 30 * 60 * 1000
          ) {
            console.log("Token validation needed");
            validateToken(token, parsedAdminData);
          } else {
            console.log("Using cached authentication state");
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        // Don't clear tokens if we're refreshing
        if (!isPageRefreshing()) {
          localStorage.removeItem("token");
          localStorage.removeItem("adminData");
          localStorage.removeItem("tokenTimestamp");
          setAdmin(null);
          setIsAuthenticated(false);
        }
      }

      setLoading(false);
    };

    // Function to validate token with API
    const validateToken = async (token, adminData) => {
      try {
        // Validate the token by making a lightweight API call
        const response = await api.get("/admin/me");

        // Update admin data if needed
        if (response.data && response.data.data) {
          localStorage.setItem("adminData", JSON.stringify(response.data.data));
          setAdmin(response.data.data);
        }

        // Update the token timestamp
        localStorage.setItem("tokenTimestamp", new Date().getTime().toString());
      } catch (validationErr) {
        console.error("Token validation failed:", validationErr);

        // Only invalidate if it's a 401 error and we're not refreshing
        if (
          validationErr.response &&
          validationErr.response.status === 401 &&
          !isPageRefreshing()
        ) {
          // Clear invalid token and admin data
          localStorage.removeItem("token");
          localStorage.removeItem("adminData");
          localStorage.removeItem("tokenTimestamp");

          setAdmin(null);
          setIsAuthenticated(false);

          // Only show toast if not on login page
          if (!location.pathname.includes("/login")) {
            showToast(
              "Session expired. Please login again.",
              { type: "error" },
              location
            );
          }
        }
      }
    };

    checkLoggedIn();
  }, []);

  // Register admin
  const register = async (adminData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Registering admin:", adminData);

      const response = await api.post("/admin/register", adminData);

      if (response.data.success) {
        const { token, admin: newAdmin } = response.data;
        const currentTime = new Date().getTime();

        localStorage.setItem("token", token);
        localStorage.setItem("adminData", JSON.stringify(newAdmin));
        localStorage.setItem("tokenTimestamp", currentTime.toString());

        setAdmin(newAdmin);
        setIsAuthenticated(true);
        showToast("Registration successful!", { force: true }, location);
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
      showToast(
        err.response?.data?.error || "Registration failed",
        {},
        location
      );
    }

    setLoading(false);
  };

  // Login admin
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with email:", email);

      const response = await api.post("/admin/login", { email, password });

      if (response.data.success) {
        const { token, admin: loggedInAdmin } = response.data;
        const currentTime = new Date().getTime();

        localStorage.setItem("token", token);
        localStorage.setItem("adminData", JSON.stringify(loggedInAdmin));
        localStorage.setItem("tokenTimestamp", currentTime.toString());

        setAdmin(loggedInAdmin);
        setIsAuthenticated(true);
        showToast("Login successful!", { force: true }, location);
      } else {
        throw new Error(response.data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
      showToast(err.response?.data?.error || "Login failed", {}, location);
    }

    setLoading(false);
  };

  // Logout admin
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminData");
    localStorage.removeItem("tokenTimestamp");

    // Clear auth header
    delete api.defaults.headers.common["Authorization"];

    setAdmin(null);
    setIsAuthenticated(false);
    showToast("Logged out successfully", {}, location);
  };

  // Update admin profile
  const updateProfile = async (adminData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put("/admin/updatedetails", adminData);

      if (response.data.success) {
        const updatedAdmin = response.data.admin;

        // Update localStorage
        localStorage.setItem("adminData", JSON.stringify(updatedAdmin));

        // Update state
        setAdmin(updatedAdmin);
        showToast("Profile updated successfully!", {}, location);

        return true;
      } else {
        throw new Error(response.data.error || "Profile update failed");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.error || "Profile update failed");
      showToast(
        err.response?.data?.error || "Profile update failed",
        {},
        location
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update admin password
  const updatePassword = async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put("/admin/updatepassword", passwordData);

      if (response.data.success) {
        showToast("Password updated successfully!", {}, location);
        return true;
      } else {
        throw new Error(response.data.error || "Password update failed");
      }
    } catch (err) {
      console.error("Password update error:", err);
      setError(err.response?.data?.error || "Password update failed");
      showToast(
        err.response?.data?.error || "Password update failed",
        {},
        location
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
