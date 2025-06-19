import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaBed,
  FaUsers,
  FaRupeeSign,
  FaPhone,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaListUl,
} from "react-icons/fa";

const RoomCard = ({ room, onDelete }) => {
  const navigate = useNavigate();
  const {
    _id,
    roomNumber,
    floorNumber,
    capacity,
    occupiedBeds,
    rentAmount,
    amenities = [],
    phone,
  } = room;
  const isVacant = occupiedBeds < capacity;

  const handleCardClick = () => {
    navigate(`/rooms/details/${_id}`);
  };

  const generateBedNames = (capacity) => {
    const names = [];
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < capacity; i++) {
      const group = Math.floor(i / 2) + 1; // Beds 1A, 1B, then 2A, 2B, etc.
      const letter = letters[i % 2];
      names.push(`${group}${letter}`);
    }
    return names;
  };

  // Use custom bed names if available, else fallback
  const bedNames = room.bedNames && Array.isArray(room.bedNames) && room.bedNames.length === capacity
    ? room.bedNames
    : generateBedNames(capacity);
  const beds = room.beds || bedNames.map((name, idx) => ({
    name,
    filled: idx < occupiedBeds,
  }));
  const handleBedClick = (bed) => {
    // Prevent card click
    window.event?.stopPropagation();
    navigate(`/tenant-onboarding?roomId=${_id}&bedName=${bed.name}`);
  };

  return (
    <div
      className="ultra-card room-card-blue compact-room-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div
        className="ultra-card-header room-header-gradient"
        style={{ padding: "1.1rem 1.2rem 0.7rem 1.2rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: 12,
          }}
        >
          <div
            className="ultra-avatar-ring"
            style={{
              width: 38,
              height: 38,
              minWidth: 38,
              minHeight: 38,
              marginBottom: 0,
            }}
          >
            <div
              className="ultra-avatar"
              style={{ width: 32, height: 32, fontSize: "1.3rem" }}
            >
              <FaBed />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              <span
                className="ultra-card-title"
                style={{ fontSize: "1.05rem" }}
              >
                Room {roomNumber}
              </span>
              <span
                className={`ultra-status-badge ${isVacant ? "vacant-badge-green" : "inactive"
                  }`}
                style={{
                  fontSize: "0.8rem",
                  padding: "0.22rem 0.7rem",
                  background: isVacant ? "#22c55e" : undefined,
                  color: isVacant ? "white" : undefined,
                }}
              >
                {isVacant ? <FaCheckCircle /> : <FaTimesCircle />}{" "}
                {isVacant ? "Vacant" : "Full"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span
                className="modern-pill-badge"
                style={{ fontSize: 12, padding: "2px 8px" }}
              >
                <FaBuilding style={{ marginRight: 4 }} /> Floor {floorNumber}
              </span>
              <span
                className="modern-pill-badge"
                style={{ fontSize: 12, padding: "2px 8px" }}
              >
                <FaRupeeSign style={{ marginRight: 4 }} /> {rentAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="ultra-card-body"
        style={{ padding: "0.8rem 1.2rem 0.7rem 1.2rem", gap: "0.5rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.7rem",
            marginBottom: "0.3rem",
          }}
        >
          <div
            className="ultra-info-row"
            style={{ padding: "0.5rem 0.7rem", fontSize: 13 }}
          >
            <FaUsers className="ultra-info-icon" />{" "}
            <span>
              Capacity: {occupiedBeds}/{capacity}
            </span>
          </div>
          <div
            className="ultra-info-row"
            style={{ padding: "0.5rem 0.7rem", fontSize: 13 }}
          >
            <FaRupeeSign className="ultra-info-icon" />{" "}
            <span>Rent: {rentAmount}</span>
          </div>
        </div>
        <div
          className="ultra-info-row"
          style={{ marginBottom: 0, padding: "0.5rem 0.7rem", fontSize: 13 }}
        >
          <FaListUl className="ultra-info-icon" />{" "}
          <span>
            Amenities: {amenities.length > 0 ? amenities.join(", ") : "None"}
          </span>
        </div>
        <div className="ultra-info-row" style={{ margin: '1rem 0 0.5rem 0', fontWeight: 600 }}>
          Bed Status:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '2px solid #22c55e', display: 'inline-block', marginRight: 4 }}></span> Vacant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginRight: 4 }}></span> Filled
          </span>
        </div>
        {/* bed selection */}
        {/* <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 12,
        }}>
          {beds.map((bed, idx) => (
            <div
              key={bed.name}
              onClick={(e) => { e.stopPropagation(); handleBedClick(bed); }}
              style={{
                border: bed.filled ? '2px solid #ef4444' : '2px solid #22c55e',
                background: bed.filled ? '#ef4444' : '#22c55e',
                borderRadius: 12,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                minHeight: 70,
                minWidth: 80,
                boxShadow: bed.filled ? '0 0 0 2px #ef4444' : '0 0 0 1px #22c55e',
                transition: 'box-shadow 0.2s',
              }}
            >
              <span style={{
                position: 'absolute',
                top: 7,
                right: 10,
                background: '#3b82f6',
                color: '#fff',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                border: '2px solid #fff',
                zIndex: 2,
              }}>{bed.name}</span>
              <FaBed size={44} color={bed.filled ? '#fff' : '#fff'} style={{ marginTop: 18, marginBottom: 10 }} />
            </div>
          ))}
        </div> */}
        {/* Bed selection*/}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 12,
          }}
        >
          {beds.map((bed, idx) => {
            const isFilled = bed.filled;
            const background = isFilled ? '#22c55e' : '#ffffff';
            const border = isFilled ? '2px solid #22c55e' : '2px solid #d1d5db';
            const boxShadow = isFilled ? '0 0 0 2px #22c55e' : '0 0 0 1px #e5e7eb';
            const iconColor = isFilled ? '#ffffff' : '#6b7280';

            return (
              <div
                key={bed.name}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBedClick(bed);
                }}
                style={{
                  border,
                  background,
                  borderRadius: 12,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: 70,
                  minWidth: 80,
                  boxShadow,
                  transition: 'box-shadow 0.2s, background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 10,
                    background: '#3b82f6',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    border: '2px solid #fff',
                    zIndex: 2,
                  }}
                >
                  {bed.name}
                </span>
                <FaBed
                  size={44}
                  color={iconColor}
                  style={{ marginTop: 18, marginBottom: 10 }}
                />
              </div>
            );
          })}
        </div>

      </div>
      <div
        className="ultra-card-actions"
        style={{ padding: "0.6rem 1.2rem", gap: "0.5rem" }}
      >
        <button
          className="ultra-btn ultra-btn-edit"
          style={{ fontSize: 13, padding: "0.45rem 1rem" }}
          onClick={() => navigate(`/rooms/edit/${_id}`)}
        >
          <FaEdit /> Edit
        </button>
        <button
          className="ultra-btn ultra-btn-delete"
          style={{ fontSize: 13, padding: "0.45rem 1rem" }}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this room?"))
              onDelete(_id);
          }}
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
