import React, { useState } from "react";
import {
  FaPlus,
  FaCheck,
  FaTimes,
  FaWifi,
  FaSnowflake,
  FaTv,
  FaShower,
  FaChair,
  FaBed,
  FaToilet,
  FaUtensils,
  FaFan,
  FaCouch,
  FaArchway,
  FaWarehouse,
} from "react-icons/fa";
import "../styles/amenities.css";

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

// Default amenities list
const defaultAmenities = [
  "Cooler",
  "TV",
  "Curtains",
  "Table Chair",
  "Almirah",
  "AC",
  "Washroom",
  "Bed",
  "Mattress",
  "WiFi",
  "Geyser",
  "Refrigerator",
  "Fan",
  "Cupboard",
];

const AmenitiesSelector = ({ selectedAmenities, onChange }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customAmenities, setCustomAmenities] = useState([]);

  // Combine default and custom amenities
  const allAmenities = [...defaultAmenities, ...customAmenities];

  const handleAmenityClick = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter((item) => item !== amenity));
    } else {
      onChange([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !allAmenities.includes(customAmenity.trim())) {
      const newAmenity = customAmenity.trim();
      setCustomAmenities([...customAmenities, newAmenity]);
      onChange([...selectedAmenities, newAmenity]);
      setCustomAmenity("");
      setShowCustomInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomAmenity();
    }
  };

  return (
    <div>
      <div className="amenities-container">
        {allAmenities.map((amenity) => (
          <div
            key={amenity}
            className={`amenity-item ${
              selectedAmenities.includes(amenity) ? "selected" : ""
            }`}
            onClick={() => handleAmenityClick(amenity)}
          >
            <span className="amenity-icon">
              {amenityIcons[amenity] || <FaPlus />}
            </span>
            <span className="amenity-label">{amenity}</span>
          </div>
        ))}

        {!showCustomInput && (
          <div
            className="custom-amenity-btn"
            onClick={() => setShowCustomInput(true)}
          >
            <FaPlus className="mr-2" />
            <span>Add Custom</span>
          </div>
        )}
      </div>

      {showCustomInput && (
        <div className="custom-amenity-input">
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            placeholder="Enter amenity name"
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <button onClick={handleAddCustomAmenity}>
            <FaCheck className="mr-1" /> Add
          </button>
          <button
            className="cancel"
            onClick={() => {
              setShowCustomInput(false);
              setCustomAmenity("");
            }}
          >
            <FaTimes className="mr-1" /> Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AmenitiesSelector;
