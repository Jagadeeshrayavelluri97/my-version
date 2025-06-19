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
    type: "PG", // Default to PG
    capacity: 1,
    rentAmount: "",
    rentType: "per_month", // Default to per month for PG
    amenities: [],
    description: "",
  });

  // For dormitory booking dates
  const [bookingDates, setBookingDates] = useState({
    checkInDate: "",
    checkOutDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [triedFetch, setTriedFetch] = useState(false);

  const {
    floorNumber,
    roomNumber,
    type,
    capacity,
    rentAmount,
    rentType,
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
        type: room.type || "PG",
        capacity: room.capacity,
        rentAmount: room.rentAmount,
        rentType: room.rentType || "per_month",
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
              type: room.type || "PG",
              capacity: room.capacity,
              rentAmount: room.rentAmount,
              rentType: room.rentType || "per_month",
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
    const { name, value } = e.target;
    
    // If type is changing, automatically set the appropriate rentType
    if (name === 'type') {
      const newRentType = value === 'PG' ? 'per_month' : 'per_day';
      setFormData({ 
        ...formData, 
        [name]: value,
        rentType: newRentType
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle amenities changes from the AmenitiesSelector component
  const handleAmenitiesChange = (selectedAmenities) => {
    setFormData({ ...formData, amenities: selectedAmenities });
  };

  // Handle booking date changes for dormitory
  const handleBookingDateChange = (e) => {
    const { name, value } = e.target;
    setBookingDates({ ...bookingDates, [name]: value });
  };

  // Calculate total rent for dormitory based on dates
  const calculateTotalRent = () => {
    if (type === 'Dormitory' && bookingDates.checkInDate && bookingDates.checkOutDate && rentAmount) {
      const checkIn = new Date(bookingDates.checkInDate);
      const checkOut = new Date(bookingDates.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return days * parseFloat(rentAmount);
    }
    return null;
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
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={onChange}
                className="form-input"
                required
              >
                <option value="PG">PG</option>
                <option value="Dormitory">Dormitory</option>
              </select>
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
                Rent Amount ({type === 'PG' ? '₹/month' : '₹/day'})
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

            {/* Date pickers for Dormitory */}
            {type === 'Dormitory' && (
              <>
                <div>
                  <label
                    htmlFor="checkInDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    id="checkInDate"
                    name="checkInDate"
                    value={bookingDates.checkInDate}
                    onChange={handleBookingDateChange}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkOutDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    id="checkOutDate"
                    name="checkOutDate"
                    value={bookingDates.checkOutDate}
                    onChange={handleBookingDateChange}
                    className="form-input"
                    min={bookingDates.checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Total rent calculation display */}
                {calculateTotalRent() && (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Total Rent Calculation
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Rent per day:</span> ₹{rentAmount}
                        </div>
                        <div>
                          <span className="font-medium">Number of days:</span> {
                            Math.ceil(
                              (new Date(bookingDates.checkOutDate) - new Date(bookingDates.checkInDate)) / 
                              (1000 * 60 * 60 * 24)
                            )
                          }
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-lg">Total rent:</span> 
                          <span className="text-lg font-bold text-blue-600 ml-2">₹{calculateTotalRent()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
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
