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

  useEffect(() => {
    // Check if user is logged in using localStorage
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminData = localStorage.getItem("adminData");

        if (token && adminData) {
          setAdmin(JSON.parse(adminData));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("adminData");
      }

      setLoading(false);
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

        localStorage.setItem("token", token);
        localStorage.setItem("adminData", JSON.stringify(newAdmin));

        setAdmin(newAdmin);
        setIsAuthenticated(true);
        showToast("Registration successful!", { force: true }, location);
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
      showToast(err.response?.data?.error || "Registration failed", {}, location);
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

        localStorage.setItem("token", token);
        localStorage.setItem("adminData", JSON.stringify(loggedInAdmin));

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
      showToast(err.response?.data?.error || "Profile update failed", {}, location);
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
      showToast(err.response?.data?.error || "Password update failed", {}, location);
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
