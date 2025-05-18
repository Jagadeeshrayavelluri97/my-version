import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRooms } from "./RoomContext";
import { useLocation } from "react-router-dom";
import { showToast } from "../utils/toast";

// Create context
const TenantContext = createContext();

// Create a custom hook to use the tenant context
export const useTenants = () => useContext(TenantContext);

const AUTH_PAGES = ["/login", "/register", "/logout"];
function isAuthPage(location) {
  return AUTH_PAGES.includes(location.pathname);
}

export const TenantProvider = ({ children }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { rooms, updateRoom } = useRooms();
  const location = useLocation();

  // Fetch tenants on component mount
  useEffect(() => {
    fetchTenants();
  }, []);

  // Fetch all tenants
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/tenants");
      if (res.data.success) {
        setTenants(res.data.data);
      } else {
        setTenants([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tenants:", err);
      // Don't show error messages on login/register pages
      if (!isAuthPage(location)) {
        // If unauthorized, don't show the error toast as it will be handled by the API interceptor
        if (!(err.response && err.response.status === 401)) {
          showToast("Failed to fetch tenants", { type: "error" }, location);
        }
      }
      setTenants([]);
      setLoading(false);
    }
  };

  // Get tenants by room ID
  const getTenantsByRoom = (roomId) => {
    return tenants.filter((tenant) => tenant.roomId === roomId);
  };

  // Add a new tenant
  const addTenant = async (tenantData) => {
    try {
      // Find the room
      const room = rooms.find((r) => r._id === tenantData.roomId);
      if (!room) {
        showToast("Room not found", { type: "error" }, location);
        return false;
      }

      // Check if room has capacity
      const roomTenants = getTenantsByRoom(tenantData.roomId);
      if (roomTenants.length >= room.capacity) {
        showToast("Room is at full capacity", { type: "error" }, location);
        return false;
      }

      // Create new tenant in backend
      const res = await axios.post("/tenants", tenantData);
      if (res.data.success) {
        setTenants([...tenants, res.data.data]);
        // Optionally update room occupancy in backend if needed
        showToast("Tenant added successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding tenant:", err);
      showToast(
        err.response?.data?.error || "Failed to add tenant",
        { type: "error" },
        location
      );
      return false;
    }
  };

  // Update a tenant
  const updateTenant = async (id, tenantData) => {
    try {
      const res = await axios.put(`/tenants/${id}`, tenantData);
      if (res.data.success) {
        setTenants(
          tenants.map((tenant) =>
            tenant._id === id ? { ...tenant, ...res.data.data } : tenant
          )
        );
        showToast("Tenant updated successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating tenant:", err);
      showToast(
        err.response?.data?.error || "Failed to update tenant",
        { type: "error" },
        location
      );
      return false;
    }
  };

  // Delete a tenant
  const deleteTenant = async (id) => {
    try {
      const res = await axios.delete(`/tenants/${id}`);
      if (res.data.success) {
        setTenants(tenants.filter((tenant) => tenant._id !== id));
        showToast("Tenant deleted successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting tenant:", err);
      showToast(
        err.response?.data?.error || "Failed to delete tenant",
        { type: "error" },
        location
      );
      return false;
    }
  };

  // Get a single tenant
  const getTenant = (id) => {
    return tenants.find((tenant) => tenant._id === id);
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        loading,
        fetchTenants,
        getTenantsByRoom,
        addTenant,
        updateTenant,
        deleteTenant,
        getTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
