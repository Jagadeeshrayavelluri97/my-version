import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserPlus,
  FaUser,
  FaBed,
  FaTrash,
  FaEdit,
  FaInfoCircle,
  FaBuilding,
  FaRupeeSign,
  FaUsers,
  FaLayerGroup,
  FaListUl,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
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
  FaDoorOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useRooms } from "../context/RoomContext";
import { useTenants } from "../context/TenantContext";

const RoomDetails = ({ roomProp, isModal }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading } = useRooms();
  const { tenants, loading: tenantsLoading, deleteTenant } = useTenants();
  const [room, setRoom] = useState(null);
  const [roomTenants, setRoomTenants] = useState([]);
  const id = roomProp?._id || paramId;
  const [editBeds, setEditBeds] = useState(false);

  // Use a ref to track if we've already set the initial data
  const [isInitialized, setIsInitialized] = useState(false);

  // Main effect to set room and tenant data
  useEffect(() => {
    // Skip if we're still loading or don't have the necessary data
    if (roomsLoading || tenantsLoading) return;

    if (roomProp) {
      setRoom(roomProp);

      // Handle both populated and non-populated roomId in tenants
      const filteredTenants = tenants.filter((t) => {
        if (typeof t.roomId === "object" && t.roomId !== null) {
          return t.roomId._id === roomProp._id;
        }
        return t.roomId === roomProp._id;
      });

      setRoomTenants(filteredTenants);
    } else {
      const foundRoom = rooms.find((r) => r._id === id);
      if (foundRoom) setRoom(foundRoom);

      // Handle both populated and non-populated roomId in tenants
      const filteredTenants = tenants.filter((t) => {
        if (typeof t.roomId === "object" && t.roomId !== null) {
          return t.roomId._id === id;
        }
        return t.roomId === id;
      });

      setRoomTenants(filteredTenants);
    }

    setIsInitialized(true);
  }, [id, rooms, tenants, roomProp, roomsLoading, tenantsLoading]);

  const handleAddTenant = () => {
    navigate(`/tenants/add?roomId=${id}&returnToRoom=true`);
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      await deleteTenant(tenantId);
    }
  };

  // Show a loading state only on initial load, not during updates
  if (!isInitialized) {
    return (
      <div className="premium-loading">
        <div className="premium-spinner"></div>
        <p className="premium-loading-text">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="premium-error-container">
        <h2 className="premium-error-heading">Room Not Found</h2>
        <button
          onClick={() => navigate("/rooms")}
          className="premium-details-back"
        >
          <FaArrowLeft className="premium-details-back-icon" /> Back to Rooms
        </button>
      </div>
    );
  }

  // Generate beds based on room capacity
  const beds = Array.from({ length: room.capacity }, (_, index) => {
    const tenant = roomTenants[index] || null;
    return { id: index + 1, tenant };
  });

  // Amenity icons
  const amenityIcons = {
    Wifi: <FaWifi />,
    AC: <FaSnowflake />,
    TV: <FaTv />,
    Shower: <FaShower />,
    Chair: <FaChair />,
    Toilet: <FaToilet />,
    Kitchen: <FaUtensils />,
    Fan: <FaFan />,
    Sofa: <FaCouch />,
    Hall: <FaArchway />,
    Store: <FaWarehouse />,
    Door: <FaDoorOpen />,
    List: <FaListUl />,
  };

  // Function to render bed layout
  const renderBedLayout = () => {
    if (!room) return null;

    const beds = [];
    for (let i = 0; i < room.capacity; i++) {
      const isOccupied = i < room.occupiedBeds;
      beds.push(
        <div
          key={i}
          className={`bed-item ${isOccupied ? "occupied" : "vacant"}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "120px",
            margin: "10px",
            borderRadius: "10px",
            border: "2px solid",
            borderColor: isOccupied ? "#ef4444" : "#10b981",
            backgroundColor: isOccupied
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(16, 185, 129, 0.1)",
            padding: "10px",
            position: "relative",
          }}
        >
          <FaBed
            size={30}
            color={isOccupied ? "#ef4444" : "#10b981"}
            style={{ marginBottom: "5px" }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: isOccupied ? "#ef4444" : "#10b981",
            }}
          >
            Bed {i + 1}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: isOccupied ? "#ef4444" : "#10b981",
            }}
          >
            {isOccupied ? "Occupied" : "Vacant"}
          </span>
          {isOccupied && i < roomTenants.length && (
            <div
              style={{
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#4f46e5",
                color: "white",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "10px",
                whiteSpace: "nowrap",
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {roomTenants[i]?.name || "Tenant"}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          margin: "20px 0",
        }}
      >
        {beds}
      </div>
    );
  };

  return (
    <div
      className="modern-room-details-glass"
      style={{
        maxWidth: 520,
        margin: "2.5rem auto",
        borderRadius: 22,
        boxShadow: "0 8px 32px rgba(80,80,120,0.13)",
        overflow: "hidden",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        position: "relative",
      }}
    >
      <div
        className="modern-room-details-header"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          color: "white",
          padding: "1.5rem 2rem 1rem 2rem",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaBed style={{ fontSize: 24 }} />
            <span style={{ fontWeight: 700, fontSize: 20 }}>
              Room {room?.roomNumber}
            </span>
          </div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background:
                room?.occupiedBeds < room?.capacity ? "#10b981" : "#ef4444",
              color: "white",
              borderRadius: 8,
              padding: "2px 12px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {room?.occupiedBeds < room?.capacity ? (
              <FaCheckCircle />
            ) : (
              <FaTimesCircle />
            )}{" "}
            {room?.occupiedBeds < room?.capacity ? "Vacant" : "Full"}
          </span>
        </div>
        <div
          style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}
        >
          <span className="modern-pill-badge">
            <FaBuilding /> Floor {room?.floorNumber}
          </span>
          <span className="modern-pill-badge">
            <FaUsers /> {room?.occupiedBeds}/{room?.capacity} Beds
          </span>
          <span className="modern-pill-badge">
            <FaRupeeSign /> {room?.rent}
          </span>
        </div>
      </div>
      <div style={{ padding: "1.2rem 2rem 1.2rem 2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <FaListUl style={{ color: "#6366f1", fontSize: 18 }} />
          <span style={{ fontWeight: 600, fontSize: 16, color: "#22223b" }}>
            Amenities
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          {room?.amenities && room.amenities.length > 0 ? (
            room.amenities.map((a) => (
              <span
                key={a}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#f3f4f6",
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 14,
                  color: "#6366f1",
                  fontWeight: 500,
                }}
              >
                {amenityIcons[a] || <FaListUl />} {a}
              </span>
            ))
          ) : (
            <span style={{ color: "#aaa" }}>No amenities listed</span>
          )}
        </div>
        {/* Bed Layout Section */}
        <div style={{ marginTop: 18, marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#6366f1",
                letterSpacing: 0.01,
              }}
            >
              Bed Layout
            </span>
            <button
              className="modern-btn modern-btn-edit"
              style={{ minWidth: 90, fontSize: 13, padding: "0.4rem 1rem" }}
              onClick={() => setEditBeds((v) => !v)}
            >
              {editBeds ? "Done" : "Edit"}
            </button>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.5)",
              borderRadius: "12px",
              padding: "15px",
              border: "1px dashed #d1d5db",
            }}
          >
            {renderBedLayout()}
          </div>
        </div>
      </div>
      {/* Sticky/Floating Action Bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.95)",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          padding: "0.7rem 2rem",
          zIndex: 10,
        }}
      >
        <button
          className="modern-btn modern-btn-edit"
          onClick={() => navigate(`/rooms/edit/${room._id}`)}
        >
          <FaEdit /> Edit Room
        </button>
        <button
          className="modern-btn modern-btn-delete"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this room?")) {
              /* delete logic here */
            }
          }}
        >
          <FaTrash /> Delete Room
        </button>
        <button className="modern-btn modern-btn-add" onClick={handleAddTenant}>
          <FaUserPlus /> Add Tenant
        </button>
      </div>
    </div>
  );
};

export default RoomDetails;
