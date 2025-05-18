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
  const { rooms, fetchRooms } = useRooms();
  const location = useLocation();

  // Track last update time for polling
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [initialized, setInitialized] = useState(false);

  // Fetch tenants on component mount and set up polling
  useEffect(() => {
    // Initial fetch
    fetchTenants();

    // Set up polling for data updates (every 10 seconds)
    const pollingInterval = setInterval(() => {
      // Only poll if we're not on an auth page
      if (!isAuthPage(location)) {
        checkForUpdates();
      }
    }, 10000); // 10 seconds

    // Clean up interval on unmount
    return () => clearInterval(pollingInterval);
  }, [location.pathname]);

  // Check if data has been updated in the database
  const checkForUpdates = async () => {
    try {
      // Use a lightweight endpoint to check for updates
      const res = await axios.get("/tenants/last-updated");
      if (res.data.success && res.data.lastUpdated) {
        // If server data is newer than our last update, refresh the data
        if (new Date(res.data.lastUpdated) > new Date(lastUpdateTime)) {
          console.log("Tenant data updated in database, refreshing...");
          await fetchTenants();
          setLastUpdateTime(Date.now());
        }
      }
    } catch (err) {
      // Silently handle errors during polling
      console.log("Error checking for tenant updates:", err);
    }
  };

  // Fetch all tenants
  const fetchTenants = async () => {
    // Don't set loading to true if we're just refreshing data in the background
    // This prevents flickering when data is refreshed
    const wasAlreadyInitialized = initialized;
    if (!wasAlreadyInitialized) {
      setLoading(true);
    }

    try {
      const res = await axios.get("/tenants");
      if (res.data.success) {
        // Only log on initial load, not during background refreshes
        if (!wasAlreadyInitialized) {
          console.log("Tenants fetched successfully:", res.data.data);
          // Check if roomId is populated
          if (res.data.data.length > 0) {
            const firstTenant = res.data.data[0];
            console.log(
              "First tenant roomId type:",
              typeof firstTenant.roomId,
              "Value:",
              firstTenant.roomId
            );
          }
        }

        setTenants(res.data.data);
        setInitialized(true);
        // Update the last update time
        setLastUpdateTime(Date.now());

        if (!wasAlreadyInitialized) {
          setLoading(false);
        }
        return res.data.data; // Return the data so it can be used by the caller
      } else {
        setTenants([]);
        if (!wasAlreadyInitialized) {
          setLoading(false);
        }
        return []; // Return empty array
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
      // Don't show error messages on login/register pages
      if (!isAuthPage(location)) {
        // If unauthorized, don't show the error toast as it will be handled by the API interceptor
        if (!(err.response && err.response.status === 401)) {
          // Only show toast if this was an initial load, not a background refresh
          if (!wasAlreadyInitialized) {
            showToast("Failed to fetch tenants", { type: "error" }, location);
          }
        }
      }
      setTenants([]);
      if (!wasAlreadyInitialized) {
        setLoading(false);
      }
      return []; // Return empty array on error
    }
  };

  // Get tenants by room ID
  const getTenantsByRoom = (roomId) => {
    return tenants.filter((tenant) => {
      // Handle both populated and non-populated roomId
      if (typeof tenant.roomId === "object" && tenant.roomId !== null) {
        return tenant.roomId._id === roomId;
      }
      return tenant.roomId === roomId;
    });
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
        showToast(
          `Room ${room.roomNumber} on Floor ${room.floorNumber} is at full capacity`,
          { type: "error" },
          location
        );
        return false;
      }

      // Create new tenant in backend
      const res = await axios.post("/tenants", tenantData);
      if (res.data.success) {
        // Add the new tenant to the local state
        setTenants([...tenants, res.data.data]);

        // Also fetch updated room data to reflect the new occupancy
        await fetchRooms();

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
        // Update the tenant in local state
        setTenants(
          tenants.map((tenant) =>
            tenant._id === id ? { ...tenant, ...res.data.data } : tenant
          )
        );

        // Also fetch updated room data to reflect any changes in occupancy
        await fetchRooms();

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
        // Remove the tenant from local state
        setTenants(tenants.filter((tenant) => tenant._id !== id));

        // Also fetch updated room data to reflect the change in occupancy
        await fetchRooms();

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
        initialized,
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
