import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaBuilding,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useRooms } from "../context/RoomContext";
import RoomCard from "../components/RoomCard";

const Rooms = () => {
  const { rooms, loading, deleteRoom } = useRooms();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleViewRoom = (roomId) => {
    navigate(`/rooms/details/${roomId}`);
  };

  // Function to handle clicking on a vacant room
  const handleVacantRoomClick = (roomId) => {
    navigate(`/tenants/add?roomId=${roomId}&returnToRoom=true`);
  };

  const handleDelete = async (id) => {
    await deleteRoom(id);
  };

  // Filter and search rooms
  const filteredRooms = rooms.filter((room) => {
    // Search by floor number or room number
    const matchesSearch =
      searchTerm === "" ||
      `Floor ${room.floorNumber}, Room ${room.roomNumber}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Filter by status
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "vacant" && room.occupiedBeds === 0) ||
      (filterStatus === "partial" &&
        room.occupiedBeds > 0 &&
        room.occupiedBeds < room.capacity) ||
      (filterStatus === "full" && room.occupiedBeds >= room.capacity);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="premium-room-container responsive-container">
        <div className="premium-room-loading">
          <div className="premium-room-spinner"></div>
        </div>
      </div>
    );
  }

  if (!loading && rooms.length === 0) {
    return (
      <div className="premium-room-container responsive-container">
        <div className="premium-room-header responsive-flex-between">
          <h1 className="premium-room-title responsive-title">Rooms</h1>
          <Link to="/rooms/add" className="premium-room-add-btn">
            <FaPlus className="premium-room-add-icon" /> Add Room
          </Link>
        </div>

        <div className="premium-room-empty">
          <FaBuilding className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="premium-room-empty-text">
            No rooms found. Add your first room to get started.
          </p>
          <Link to="/rooms/add" className="premium-room-add-btn inline-flex">
            <FaPlus className="premium-room-add-icon" /> Add Your First Room
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-room-container responsive-container">
      <div className="premium-room-header responsive-flex-between">
        <h1 className="premium-room-title responsive-title">Rooms</h1>
        <Link to="/rooms/add" className="premium-room-add-btn">
          <FaPlus className="premium-room-add-icon" /> Add Room
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="premium-room-controls responsive-flex">
        <div className="premium-room-search">
          <input
            type="text"
            placeholder="Search rooms..."
            className="premium-room-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="premium-room-search-icon" />
        </div>

        <div className="premium-room-filter">
          <div className="premium-room-filter-label">
            <FaFilter />
            <span>Filter:</span>
          </div>

          <select
            className="premium-room-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Rooms</option>
            <option value="vacant">Vacant</option>
            <option value="partial">Partially Occupied</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="room-cards-container">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            onDelete={handleDelete}
            onViewRoom={handleViewRoom}
            onVacantRoomClick={handleVacantRoomClick}
          />
        ))}
      </div>

      {/* Show message when no rooms match filters */}
      {filteredRooms.length === 0 && !loading && (
        <div className="premium-room-empty">
          <FaExclamationTriangle
            className="mx-auto mb-4 text-gray-400"
            size={48}
          />
          <p className="premium-room-empty-text">
            No rooms match your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Rooms;
