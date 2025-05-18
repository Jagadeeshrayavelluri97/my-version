import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { useRooms } from "../context/RoomContext";
import AmenitiesSelector from "../components/AmenitiesSelector";
import axios from "axios";
import { showToast } from "../utils/toast";

const RoomForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  const {
    rooms,
    getRoom,
    addRoom,
    updateRoom,
    loading: roomsLoading,
    initialized,
    fetchRooms,
  } = useRooms();

  const [formData, setFormData] = useState({
    floorNumber: "",
    roomNumber: "",
    capacity: 1,
    rentAmount: "",
    amenities: [],
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [triedFetch, setTriedFetch] = useState(false);

  const {
    floorNumber,
    roomNumber,
    capacity,
    rentAmount,
    amenities,
    description,
  } = formData;

  // Amenities are now handled by the AmenitiesSelector component

  // Fetch rooms data if needed
  useEffect(() => {
    if (!isEditMode) {
      setFetchLoading(false);
      return;
    }

    // If rooms are still loading or context not initialized, wait
    if (roomsLoading || !initialized) {
      console.log("Waiting for rooms to load or context to initialize...");
      return;
    }

    // Try to find the room in the current rooms array
    const room = getRoom(id);
    if (room) {
      console.log("Room found in context:", room);
      setFormData({
        floorNumber: room.floorNumber,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        rentAmount: room.rentAmount,
        amenities: room.amenities || [],
        description: room.description || "",
      });
      setFetchLoading(false);
    } else if (!triedFetch) {
      // If room not found and we haven't tried fetching yet, try direct API call
      console.log("Room not found, trying direct API call...");

      // First try a direct API call to get the specific room
      const fetchSingleRoom = async () => {
        try {
          const response = await axios.get(`/rooms/${id}`);
          if (response.data.success) {
            const room = response.data.data;
            console.log("Room fetched directly:", room);
            setFormData({
              floorNumber: room.floorNumber,
              roomNumber: room.roomNumber,
              capacity: room.capacity,
              rentAmount: room.rentAmount,
              amenities: room.amenities || [],
              description: room.description || "",
            });
            setFetchLoading(false);
            // Also update the rooms context
            fetchRooms();
          } else {
            // If direct API call fails, try fetching all rooms
            console.log("Direct API call failed, fetching all rooms...");
            fetchRooms();
          }
        } catch (err) {
          console.error("Error fetching single room:", err);
          showToast("Error loading room data", { type: "error" }, location);
          fetchRooms();
        }
      };

      fetchSingleRoom();
      setTriedFetch(true);
    } else if (triedFetch && !roomsLoading) {
      // If we've already tried fetching and rooms are not loading, room doesn't exist
      console.log("Room not found after fetch attempts");
      setFetchLoading(false);
    }
  }, [
    id,
    isEditMode,
    getRoom,
    roomsLoading,
    fetchRooms,
    initialized,
    triedFetch,
    location,
  ]);

  useEffect(() => {
    setTriedFetch(false);
  }, [id, isEditMode]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle amenities changes from the AmenitiesSelector component
  const handleAmenitiesChange = (selectedAmenities) => {
    setFormData({ ...formData, amenities: selectedAmenities });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Frontend validation
    if (
      !formData.floorNumber ||
      !formData.roomNumber ||
      !formData.rentAmount ||
      formData.capacity < 1
    ) {
      setLoading(false);
      alert("Please fill all required fields with valid values.");
      return;
    }

    try {
      let result;
      if (isEditMode) {
        result = await updateRoom(id, formData);
      } else {
        result = await addRoom(formData);
      }
      setLoading(false);

      // If addRoom returns false, do not navigate
      if (result === false) return;

      navigate("/rooms");
    } catch (err) {
      setLoading(false);
      alert(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to save room. Please try again."
      );
      console.error("Error saving room:", err);
    }
  };

  // Show loading spinner only if rooms are loading (add mode) or if fetching room (edit mode)
  if (
    (!isEditMode && roomsLoading) ||
    (isEditMode && (fetchLoading || roomsLoading))
  ) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">
          {isEditMode
            ? "Loading room data for editing..."
            : "Loading room form..."}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {roomsLoading ? "Fetching rooms..." : ""}
          {fetchLoading ? "Preparing form..." : ""}
        </p>
      </div>
    );
  }

  // Show a message if the room is not found after loading
  if (isEditMode && !roomsLoading && !fetchLoading && !getRoom(id)) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-600 text-lg font-semibold">Room not found</p>
        <p className="text-gray-600 mt-2 mb-4 text-center">
          The room you're trying to edit may have been deleted or doesn't exist.
          <br />
          Please select a room from the rooms list.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/rooms")}
            className="btn btn-secondary"
          >
            Back to Rooms
          </button>
          <button
            onClick={() => navigate("/rooms/add")}
            className="btn btn-primary"
          >
            Add New Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? "Edit Room" : "Add New Room"}
        </h1>
        <button
          onClick={() => navigate("/rooms")}
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Rooms
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="floorNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Floor Number
              </label>
              <input
                type="number"
                id="floorNumber"
                name="floorNumber"
                value={floorNumber}
                onChange={onChange}
                className="form-input"
                required
                min="0"
              />
            </div>

            <div>
              <label
                htmlFor="roomNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Room Number
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={roomNumber}
                onChange={onChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Capacity (persons)
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={capacity}
                onChange={onChange}
                className="form-input"
                required
                min="1"
              />
            </div>

            <div>
              <label
                htmlFor="rentAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rent Amount (₹/month)
              </label>
              <input
                type="number"
                id="rentAmount"
                name="rentAmount"
                value={rentAmount}
                onChange={onChange}
                className="form-input"
                required
                min="0"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities
            </label>
            <AmenitiesSelector
              selectedAmenities={amenities}
              onChange={handleAmenitiesChange}
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              rows="3"
              className="form-input"
            ></textarea>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center justify-center w-full md:w-auto"
            >
              <FaSave className="mr-2" />
              {loading ? "Saving..." : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
