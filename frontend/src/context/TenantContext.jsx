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
<<<<<<< HEAD
      const res = await axios.get('/tenants');
=======
      const res = await axios.get("/tenants");
>>>>>>> chenna
      if (res.data.success) {
        setTenants(res.data.data);
      } else {
        setTenants([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tenants:", err);
<<<<<<< HEAD
      if (!isAuthPage(location)) {
        showToast("Failed to fetch tenants", { type: "error" }, location);
      }
=======
      // Don't show error messages on login/register pages
      if (!isAuthPage(location)) {
        // If unauthorized, don't show the error toast as it will be handled by the API interceptor
        if (!(err.response && err.response.status === 401)) {
          showToast("Failed to fetch tenants", { type: "error" }, location);
        }
      }
      setTenants([]);
>>>>>>> chenna
      setLoading(false);
    }
  };

  // Get tenants by room ID
  const getTenantsByRoom = (roomId) => {
<<<<<<< HEAD
    return tenants.filter(tenant => tenant.roomId === roomId);
=======
    return tenants.filter((tenant) => tenant.roomId === roomId);
>>>>>>> chenna
  };

  // Add a new tenant
  const addTenant = async (tenantData) => {
    try {
      // Find the room
<<<<<<< HEAD
      const room = rooms.find(r => r._id === tenantData.roomId);
=======
      const room = rooms.find((r) => r._id === tenantData.roomId);
>>>>>>> chenna
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
<<<<<<< HEAD
      const res = await axios.post('/tenants', tenantData);
=======
      const res = await axios.post("/tenants", tenantData);
>>>>>>> chenna
      if (res.data.success) {
        setTenants([...tenants, res.data.data]);
        // Optionally update room occupancy in backend if needed
        showToast("Tenant added successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding tenant:", err);
<<<<<<< HEAD
      showToast(err.response?.data?.error || "Failed to add tenant", { type: "error" }, location);
=======
      showToast(
        err.response?.data?.error || "Failed to add tenant",
        { type: "error" },
        location
      );
>>>>>>> chenna
      return false;
    }
  };

  // Update a tenant
  const updateTenant = async (id, tenantData) => {
    try {
      const res = await axios.put(`/tenants/${id}`, tenantData);
      if (res.data.success) {
        setTenants(
<<<<<<< HEAD
          tenants.map((tenant) => (tenant._id === id ? { ...tenant, ...res.data.data } : tenant))
=======
          tenants.map((tenant) =>
            tenant._id === id ? { ...tenant, ...res.data.data } : tenant
          )
>>>>>>> chenna
        );
        showToast("Tenant updated successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating tenant:", err);
<<<<<<< HEAD
      showToast(err.response?.data?.error || "Failed to update tenant", { type: "error" }, location);
=======
      showToast(
        err.response?.data?.error || "Failed to update tenant",
        { type: "error" },
        location
      );
>>>>>>> chenna
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
<<<<<<< HEAD
      showToast(err.response?.data?.error || "Failed to delete tenant", { type: "error" }, location);
=======
      showToast(
        err.response?.data?.error || "Failed to delete tenant",
        { type: "error" },
        location
      );
>>>>>>> chenna
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
<<<<<<< HEAD
}; 
=======
};
>>>>>>> chenna
