import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { useRooms } from "../context/RoomContext";
import AmenitiesSelector from "../components/AmenitiesSelector";

const RoomForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

    if (!initialized) {
      return;
    }

    if (roomsLoading) {
      return;
    }

    const room = getRoom(id);
    if (room) {
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
      fetchRooms();
      setTriedFetch(true);
    }
  }, [id, isEditMode, getRoom, roomsLoading, fetchRooms, initialized, triedFetch]);

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
  if ((!isEditMode && roomsLoading) || (isEditMode && (fetchLoading || roomsLoading))) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading room data...</p>
      </div>
    );
  }

  // Show a message if the room is not found after loading
  if (isEditMode && !roomsLoading && !fetchLoading && !getRoom(id)) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-600 text-lg font-semibold">Room not found.</p>
        <button
          onClick={() => navigate('/rooms')}
          className="btn btn-secondary mt-4"
        >
          Back to Rooms
        </button>
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
