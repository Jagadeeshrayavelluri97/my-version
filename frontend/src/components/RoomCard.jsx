import React from "react";
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
import { useTenants } from "../context/TenantContext";
import { updateRoom } from '../utils/api';
import { useState } from 'react';

const RoomCard = ({ room, onDelete }) => {
  const navigate = useNavigate();
  const {
    _id,
    roomNumber,
    floorNumber,
    type = "PG", // Default to PG for backward compatibility
    capacity,
    occupiedBeds,
    rentAmount,
    rentType = "per_month", // Default to per_month for backward compatibility
    amenities = [],
    phone,
  } = room;
  const isVacant = occupiedBeds < capacity;
  const { getTenantsByRoom } = useTenants();
  const roomTenants = getTenantsByRoom(_id);
  // Map bed numbers to tenants
  const bedTenants = Array(capacity).fill(null);
  roomTenants.forEach((tenant) => {
    if (tenant.bedNumber && tenant.bedNumber <= capacity) {
      bedTenants[tenant.bedNumber - 1] = tenant;
    }
  });

  // Local state for bed status (filled/vacant)
  const [bedStatus, setBedStatus] = useState(() => {
    // First N beds are filled, rest are vacant
    return Array.from({ length: capacity }, (_, i) => i < occupiedBeds);
  });
  // Update backend when bedStatus changes
  const updateOccupiedBeds = async (newStatus) => {
    const filledCount = newStatus.filter(Boolean).length;
    try {
      await updateRoom(_id, { occupiedBeds: filledCount });
    } catch (err) {
      // Optionally show error
    }
  };

  // Get rent display text based on type
  const getRentDisplay = () => {
    if (type === 'Dormitory') {
      return `₹${rentAmount}/day`;
    }
    return `₹${rentAmount}/month`;
  };

  // Get type badge color
  const getTypeBadgeColor = () => {
    return type === 'PG' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  // Mini bed layout for the card
  const renderMiniBedLayout = () => {
    const beds = Array.from({ length: capacity }, (_, i) => false);
    for (let i = 0; i < occupiedBeds; i++) beds[i] = true;
    // Dynamically choose columns for best fit
    let columns = 2;
    if (capacity <= 4) columns = 2;
    else if (capacity <= 6) columns = 3;
    else if (capacity <= 12) columns = 4;
    else columns = 5;
    return (
      <div style={{ marginTop: 14, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 4, border: '2px solid #10b981' }}></span>
            <span style={{ fontSize: 15, color: '#222' }}>Vacant</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4, border: '2px solid #ef4444' }}></span>
            <span style={{ fontSize: 15, color: '#222' }}>Filled</span>
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)` ,
            gap: 14,
            margin: '0 auto',
            width: '100%',
            maxWidth: 260,
            justifyItems: 'center',
          }}
        >
          {beds.map((isFilled, i) => (
            <div
              key={i}
              style={{
                border: `3px solid ${isFilled ? '#ef4444' : '#10b981'}`,
                borderRadius: 12,
                background: isFilled ? "#ffebeb" : "#e6fff5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 60,
                width: 54,
                position: "relative",
                boxShadow: isFilled ? "0 2px 6px rgba(239,68,68,0.12)" : "0 2px 4px rgba(16,185,129,0.12)",
                transition: "all 0.2s",
                padding: 4,
              }}
            >
              <FaBed size={30} color={isFilled ? "#ef4444" : "#10b981"} />
              <div
                style={{
                  position: "absolute",
                  top: 7,
                  right: 10,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: isFilled ? "#ef4444" : "#3b82f6",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: isFilled ? "0 2px 6px rgba(239,68,68,0.15)" : "0 1px 2px rgba(59,130,246,0.07)",
                }}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleCardClick = () => {
    navigate(`/rooms/details/${_id}`);
  };

  return (
    <div
      className="ultra-card room-card-blue compact-room-card"
      onClick={handleCardClick}
      style={{
        cursor: "pointer",
        margin: '18px',
        maxWidth: 350,
        minWidth: 270,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        height: 'auto', // let it grow
        paddingBottom: 18,
      }}
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
                className={`ultra-status-badge ${
                  isVacant ? "vacant-badge-green" : "inactive"
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
                className={`modern-pill-badge ${getTypeBadgeColor()}`}
                style={{ fontSize: 12, padding: "2px 8px" }}
              >
                {type}
              </span>
              <span
                className="modern-pill-badge"
                style={{ fontSize: 12, padding: "2px 8px" }}
              >
                <FaRupeeSign style={{ marginRight: 4 }} /> {getRentDisplay()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="ultra-card-body"
        style={{
          padding: "0.8rem 1.2rem 0.7rem 1.2rem",
          gap: "0.5rem",
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
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
            <span>Rent: {getRentDisplay()}</span>
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
        {/* Bed Status Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Bed Status:</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: '2px solid #10b981',
                marginRight: 6,
                background: '#e6fff5',
              }} />
              Vacant
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#ef4444',
                marginRight: 6,
                border: '2px solid #ef4444',
              }} />
              Filled
            </span>
          </div>
          {/* Bed Grid - toggleable */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, 1fr)`,
              gap: '16px',
              marginTop: '0.5rem',
            }}
          >
            {bedStatus.map((isFilled, i) => (
              <div
                key={i}
                title={isFilled ? 'Filled' : 'Vacant'}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/tenant-onboarding', { state: { roomId: _id, bedNumber: i + 1 } });
                }}
                style={{
                  position: 'relative',
                  border: `2px solid ${isFilled ? '#ef4444' : '#10b981'}`,
                  borderRadius: 12,
                  background: isFilled ? '#ffebeb' : '#e6fff5',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 70,
                  minWidth: 70,
                  boxShadow: isFilled ? '0 2px 8px rgba(239,68,68,0.08)' : '0 1px 3px rgba(16,185,129,0.08)',
                  transition: 'all 0.2s',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <FaBed size={32} color={isFilled ? '#ef4444' : '#10b981'} />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isFilled ? '#ef4444' : '#3b82f6',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: isFilled ? '0 2px 6px rgba(239,68,68,0.15)' : '0 1px 2px rgba(59,130,246,0.07)',
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: isFilled ? '#ef4444' : '#10b981' }}>
                  {isFilled ? 'Filled' : 'Vacant'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className="ultra-card-actions"
        style={{ padding: "0.6rem 1.2rem", gap: "0.5rem" }}
      >
        <button
          className="ultra-btn ultra-btn-edit"
          style={{ fontSize: 13, padding: "0.45rem 1rem" }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/rooms/edit/${_id}`);
          }}
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
