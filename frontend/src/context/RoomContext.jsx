import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useLocation } from "react-router-dom";
import { showToast } from "../utils/toast";

// Create context
const RoomContext = createContext();

// Create a custom hook to use the room context
export const useRooms = () => useContext(RoomContext);

const AUTH_PAGES = ["/login", "/register", "/logout"];
function isAuthPage(location) {
  return AUTH_PAGES.includes(location.pathname);
}

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();

  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // ✅ First define fetchRooms
  const fetchRooms = useCallback(async () => {
    const wasAlreadyInitialized = initialized;
    if (!wasAlreadyInitialized) {
      setLoading(true);
    }

    try {
      const res = await api.get("/rooms");
      if (res.data.success) {
        setRooms(res.data.data);
        setInitialized(true);
        setLastUpdateTime(Date.now());
      } else {
        setRooms([]);
      }
      if (!wasAlreadyInitialized) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      if (!isAuthPage(location)) {
        if (!(err.response && err.response.status === 401)) {
          if (!wasAlreadyInitialized) {
            showToast("Failed to fetch rooms", { type: "error" }, location);
          }
        }
      }
      setRooms([]);
      if (!wasAlreadyInitialized) {
        setLoading(false);
      }
    }
  }, [initialized, location]);

  // ✅ Now define checkForUpdates which uses fetchRooms
  const checkForUpdates = useCallback(async () => {
    try {
      const res = await api.get("/rooms/last-updated");
      if (res.data.success && res.data.lastUpdated) {
        if (new Date(res.data.lastUpdated) > new Date(lastUpdateTime)) {
          console.log("Room data updated in database, refreshing...");
          await fetchRooms();
          setLastUpdateTime(Date.now());
        }
      }
    } catch (err) {
      console.log("Error checking for updates:", err);
    }
  }, [lastUpdateTime, fetchRooms]);

  // Fetch rooms on component mount and poll updates
  useEffect(() => {
    fetchRooms();
    const pollingInterval = setInterval(() => {
      if (!isAuthPage(location)) {
        checkForUpdates();
      }
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, [location.pathname, fetchRooms, checkForUpdates]);

  const addRoom = async (roomData) => {
    try {
      const res = await api.post("/rooms", roomData);
      if (res.data.success) {
        setRooms([...rooms, res.data.data]);
        showToast("Room created successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding room:", err);
      showToast(err.response?.data?.error || "Failed to create room", { type: "error" }, location);
      return false;
    }
  };

  const updateRoom = async (id, roomData) => {
    try {
      const res = await api.put(`/rooms/${id}`, roomData);
      if (res.data.success) {
        setRooms(
          rooms.map((room) =>
            room._id === id ? { ...room, ...res.data.data } : room
          )
        );
        showToast("Room updated successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating room:", err);
      showToast(err.response?.data?.error || "Failed to update room", { type: "error" }, location);
      return false;
    }
  };

  const deleteRoom = async (id) => {
    try {
      const res = await api.delete(`/rooms/${id}`);
      if (res.data.success) {
        setRooms(rooms.filter((room) => room._id !== id));
        showToast("Room deleted successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting room:", err);
      showToast(err.response?.data?.error || "Failed to delete room", { type: "error" }, location);
      return false;
    }
  };

  const getRoom = (id) => {
    return rooms.find((room) => room._id === id);
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        loading,
        initialized,
        fetchRooms,
        addRoom,
        updateRoom,
        deleteRoom,
        getRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
