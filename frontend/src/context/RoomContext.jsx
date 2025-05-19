import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
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

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch all rooms
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/rooms");
      if (res.data.success) {
        setRooms(res.data.data);
        setInitialized(true);
      } else {
        setRooms([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      // Don't show error messages on login/register pages
      if (!isAuthPage(location)) {
        // If unauthorized, don't show the error toast as it will be handled by the API interceptor
        if (!(err.response && err.response.status === 401)) {
          showToast("Failed to fetch rooms", { type: "error" }, location);
        }
      }
      setRooms([]);
      setLoading(false);
    }
  };

  // Add a new room
  const addRoom = async (roomData) => {
    try {
      const res = await axios.post("/rooms", roomData);
      if (res.data.success) {
        setRooms([...rooms, res.data.data]);
        showToast("Room created successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding room:", err);
      showToast(
        err.response?.data?.error || "Failed to create room",
        { type: "error" },
        location
      );
      return false;
    }
  };

  // Update a room
  const updateRoom = async (id, roomData) => {
    try {
      const res = await axios.put(`/rooms/${id}`, roomData);
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
      showToast(
        err.response?.data?.error || "Failed to update room",
        { type: "error" },
        location
      );
      return false;
    }
  };

  // Delete a room
  const deleteRoom = async (id) => {
    try {
      const res = await axios.delete(`/rooms/${id}`);
      if (res.data.success) {
        setRooms(rooms.filter((room) => room._id !== id));
        showToast("Room deleted successfully", { type: "success" }, location);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting room:", err);
      showToast(
        err.response?.data?.error || "Failed to delete room",
        { type: "error" },
        location
      );
      return false;
    }
  };

  // Get a single room
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
