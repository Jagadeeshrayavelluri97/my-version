import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
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

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await api.get("/tenants/last-updated");
      if (res.data.success && res.data.lastUpdated) {
        if (new Date(res.data.lastUpdated) > new Date(lastUpdateTime)) {
          console.log("Tenant data updated in database, refreshing...");
          await fetchTenants();
          setLastUpdateTime(Date.now());
        }
      }
    } catch (err) {
      console.log("Error checking for tenant updates:", err);
    }
  }, [lastUpdateTime]);

  const fetchTenants = useCallback(async () => {
    const wasAlreadyInitialized = initialized;
    if (!wasAlreadyInitialized) {
      setLoading(true);
    }

    try {
      const res = await api.get("/tenants");
      if (res.data.success) {
        if (!wasAlreadyInitialized) {
          console.log("Tenants fetched successfully:", res.data.data);
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
        setLastUpdateTime(Date.now());

        if (!wasAlreadyInitialized) {
          setLoading(false);
        }
        return res.data.data;
      } else {
        setTenants([]);
        if (!wasAlreadyInitialized) {
          setLoading(false);
        }
        return [];
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
      if (!isAuthPage(location)) {
        if (!(err.response && err.response.status === 401)) {
          if (!wasAlreadyInitialized) {
            showToast("Failed to fetch tenants", { type: "error" }, location);
          }
        }
      }
      setTenants([]);
      if (!wasAlreadyInitialized) {
        setLoading(false);
      }
      return [];
    }
  }, [initialized, location]);

  // Fetch tenants on component mount and set up polling
  useEffect(() => {
    fetchTenants();

    const pollingInterval = setInterval(() => {
      if (!isAuthPage(location)) {
        checkForUpdates();
    }
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, [location.pathname, fetchTenants, checkForUpdates]);

  const getTenantsByRoom = useCallback((roomId) => {
    return tenants.filter((tenant) => {
      if (typeof tenant.roomId === "object" && tenant.roomId !== null) {
        return tenant.roomId._id === roomId;
      }
      return tenant.roomId === roomId;
    });
  }, [tenants]);

  const addTenant = useCallback(async (tenantData) => {
    try {
      const room = rooms.find((r) => r._id === tenantData.roomId);
      if (!room) {
        showToast("Room not found", { type: "error" }, location);
        return false;
      }

      const roomTenants = getTenantsByRoom(tenantData.roomId);
      if (roomTenants.length >= room.capacity) {
        showToast(
          `Room ${room.roomNumber} on Floor ${room.floorNumber} is at full capacity`,
          { type: "error" },
          location
        );
        return false;
      }

      const res = await api.post("/tenants", tenantData);
      if (res.data.success) {
        setTenants((prevTenants) => [...prevTenants, res.data.data]);
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
  }, [rooms, getTenantsByRoom, fetchRooms, location]);

  const updateTenant = useCallback(async (id, tenantData) => {
    try {
      const res = await api.put(`/tenants/${id}`, tenantData);
      if (res.data.success) {
        setTenants((prevTenants) =>
          prevTenants.map((tenant) =>
            tenant._id === id ? { ...tenant, ...res.data.data } : tenant
          )
        );
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
  }, [fetchRooms, location]);

  const deleteTenant = useCallback(async (id) => {
    try {
      const res = await api.delete(`/tenants/${id}`);
      if (res.data.success) {
        setTenants((prevTenants) => prevTenants.filter((tenant) => tenant._id !== id));
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
  }, [location]);

  const getTenant = useCallback((id) => {
    return tenants.find((tenant) => tenant._id === id);
  }, [tenants]);

  const getTenantRoomNumber = useCallback((roomId) => {
    const room = rooms.find((r) => r._id === roomId);
    return room ? `Room ${room.roomNumber} (Floor ${room.floorNumber})` : 'N/A';
  }, [rooms]);

  const value = useMemo(() => ({
        tenants,
        loading,
        initialized,
        fetchTenants,
        addTenant,
        updateTenant,
        deleteTenant,
        getTenant,
    getTenantsByRoom,
    getTenantRoomNumber,
  }), [tenants, loading, initialized, fetchTenants, addTenant, updateTenant, deleteTenant, getTenant, getTenantsByRoom, getTenantRoomNumber]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
