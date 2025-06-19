import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaBed,
  FaUsers,
  FaRupeeSign,
  FaWifi,
  FaSnowflake,
  FaTv,
  FaShower,
  FaChair,
  FaToilet,
  FaUtensils,
  FaFan,
  FaCouch,
  FaArchway,
  FaWarehouse,
  FaListUl,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaDoorOpen,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Mapping of amenity names to icons
const amenityIcons = {
  AC: <FaSnowflake />,
  TV: <FaTv />,
  WiFi: <FaWifi />,
  Geyser: <FaShower />,
  Refrigerator: <FaSnowflake />,
  "Washing Machine": <FaFan />,
  Cupboard: <FaWarehouse />,
  "Study Table": <FaChair />,
  Chair: <FaChair />,
  Bed: <FaBed />,
  Washroom: <FaToilet />,
  Kitchen: <FaUtensils />,
  Fan: <FaFan />,
  Sofa: <FaCouch />,
  Balcony: <FaArchway />,
  Cooler: <FaSnowflake />,
  Curtains: <FaArchway />,
  "Table Chair": <FaChair />,
  Almirah: <FaWarehouse />,
  Mattress: <FaBed />,
};

const PremiumRoomCard = ({ room, onDelete, onViewRoom, onVacantRoomClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    _id,
    floorNumber,
    roomNumber,
    capacity,
    rentAmount,
    occupiedBeds,
    amenities,
  } = room;

  // Determine room status
  const isVacant = occupiedBeds === 0;
  const isFull = occupiedBeds >= capacity;
  const isPartiallyOccupied = !isVacant && !isFull;

  // Get status class and text
  const getStatusClass = () => {
    if (isVacant) return "premium-status-vacant";
    if (isPartiallyOccupied) return "premium-status-partial";
    return "premium-status-full";
  };

  const getStatusText = () => {
    if (isVacant) return "Vacant";
    if (isPartiallyOccupied) return "Partially Occupied";
    return "Full";
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isVacant) return <FaCheckCircle className="mr-2" />;
    if (isPartiallyOccupied) return <FaExclamationCircle className="mr-2" />;
    return <FaTimesCircle className="mr-2" />;
  };

  // Get card class based on status
  const getCardClass = () => {
    if (isVacant) return "vacant";
    if (isPartiallyOccupied) return "partial";
    return "full";
  };

  // Handle click on room card
  const handleCardClick = () => {
    if (isVacant) {
      onVacantRoomClick(_id);
    } else {
      onViewRoom(_id);
    }
  };

  // Handle delete with confirmation
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm("Are you sure you want to delete this room?")) {
      onDelete(_id);
    }
  };

  // Prevent propagation for edit button
  const handleEdit = (e) => {
    e.stopPropagation();
  };

  // Handle mouse events
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Display only first 3 amenities + count of remaining
  const displayAmenities = () => {
    if (!amenities || amenities.length === 0) {
      return <span className="text-gray-400 text-xs italic">No amenities</span>;
    }

    const visibleAmenities = amenities.slice(0, 3);
    const remainingCount = amenities.length - 3;

    return (
      <div className="premium-card-amenities-list">
        {visibleAmenities.map((amenity, index) => (
          <span
            key={amenity}
            className="premium-card-amenity"
            style={{
              transitionDelay: `${index * 0.1}s`,
              transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            }}
          >
            <span className="premium-card-amenity-icon">
              {amenityIcons[amenity] || <FaBed />}
            </span>
            {amenity}
          </span>
        ))}
        {remainingCount > 0 && (
          <span
            className="premium-card-amenity"
            style={{
              transitionDelay: `${visibleAmenities.length * 0.1}s`,
              transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            }}
          >
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`premium-card ${getCardClass()}`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="premium-card-header">
        <h3 className="premium-card-title">
          <FaDoorOpen
            className="mr-2"
            style={{
              transform: isHovered
                ? "rotate(15deg) scale(1.2)"
                : "rotate(0) scale(1)",
              transition: "transform 0.4s ease",
              display: "inline-block",
            }}
          />
          Floor {floorNumber}, Room {roomNumber}
        </h3>
        <div className="premium-card-subtitle">
          <div className="premium-card-info">
            <FaUsers className="premium-card-icon" />
            <span>
              {capacity} {capacity > 1 ? "persons" : "person"}
            </span>
          </div>
          <div className="premium-card-info">
            <FaRupeeSign className="premium-card-icon" />
            <span>{rentAmount}/month</span>
          </div>
        </div>
      </div>

      <div className="premium-card-body">
        <div className="premium-card-amenities">
          <h4 className="premium-card-amenities-title">
            <FaListUl
              className="premium-card-amenities-title-icon"
              style={{
                transform: isHovered ? "rotate(360deg)" : "rotate(0)",
                transition: "transform 0.6s ease",
              }}
            />
            Amenities
          </h4>
          {displayAmenities()}
        </div>

        <div className="premium-card-status">
          <div className={`premium-status-badge ${getStatusClass()}`}>
            <span>
              {getStatusIcon()}
              {occupiedBeds}/{capacity} - {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="premium-card-actions">
        <Link
          to={`/rooms/edit/${_id}`}
          className="premium-card-btn premium-card-btn-edit"
          onClick={handleEdit}
          style={{
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            transition: "transform 0.4s ease",
            transitionDelay: "0.1s",
          }}
        >
          <FaEdit
            className="premium-card-btn-icon"
            style={{
              transform: isHovered ? "rotate(15deg)" : "rotate(0)",
              transition: "transform 0.4s ease",
            }}
          />
          Edit
        </Link>
        <button
          className="premium-card-btn premium-card-btn-delete"
          onClick={handleDelete}
          style={{
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            transition: "transform 0.4s ease",
            transitionDelay: "0.2s",
          }}
        >
          <FaTrash
            className="premium-card-btn-icon"
            style={{
              transform: isHovered ? "rotate(-15deg)" : "rotate(0)",
              transition: "transform 0.4s ease",
            }}
          />
          Delete
        </button>
      </div>
    </div>
  );
};

export default PremiumRoomCard;
