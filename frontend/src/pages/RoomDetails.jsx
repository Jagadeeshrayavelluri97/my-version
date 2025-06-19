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
import { useAuth } from "../context/AuthContext";

const RoomDetails = ({ roomProp, isModal }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading, deleteRoom } = useRooms();
  const { tenants, loading: tenantsLoading, deleteTenant } = useTenants();
  const { admin } = useAuth();
  const [room, setRoom] = useState(null);
  const [roomTenants, setRoomTenants] = useState([]);
  const id = roomProp?._id || paramId;

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

  // Function to handle adding a tenant to the room
  const handleAddTenant = (bedNumber = null) => {
    // If a specific bed number is provided, include it in the URL
    const bedParam = bedNumber ? `&bedNumber=${bedNumber}` : '';
    navigate(`/tenants/add?roomId=${id}&returnToRoom=true${bedParam}`);
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

  // Get rent display text based on type
  const getRentDisplay = () => {
    if (!room) return '';
    if (room.type === 'Dormitory') {
      return `₹${room.rentAmount}/day`;
    }
    return `₹${room.rentAmount}/month`;
  };

  // Get type badge color
  const getTypeBadgeColor = () => {
    if (!room) return '';
    return room.type === 'PG' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

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

  // Function to handle room deletion
  const handleDeleteRoom = async () => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      const success = await deleteRoom(id);
      if (success) {
        navigate("/rooms");
      }
    }
  };

  // Function to render bed layout
  const renderBedLayout = () => {
    if (!room) return null;

    // Create an array to track which beds are occupied
    const occupiedBedMap = Array(room.capacity).fill(false);
    const bedTenants = Array(room.capacity).fill(null);

    // Use the bedNumber field from the tenant model to assign tenants to beds
    roomTenants.forEach((tenant) => {
      if (tenant.bedNumber && tenant.bedNumber <= room.capacity) {
        const bedIndex = tenant.bedNumber - 1;
        occupiedBedMap[bedIndex] = true;
        bedTenants[bedIndex] = tenant;
      }
    });

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(110px, 1fr))`,
          gap: "18px",
          margin: "0 auto",
          width: "100%",
          maxWidth: 600,
        }}
      >
        {Array.from({ length: room.capacity }, (_, i) => {
          const isOccupied = occupiedBedMap[i];
          const tenant = bedTenants[i];
          return (
            <div
              key={i}
              title={isOccupied ? (tenant ? tenant.name : "Filled") : "Vacant"}
              onClick={() => {
                if (isOccupied && tenant) {
                  navigate(`/tenants/edit/${tenant._id}`);
                } else {
                  handleAddTenant(i + 1);
                }
              }}
              style={{
                border: `2px solid ${isOccupied ? '#ef4444' : '#10b981'}`,
                borderRadius: 12,
                background: isOccupied ? "#ffebeb" : "#e6fff5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 90,
                minWidth: 100,
                position: "relative",
                boxShadow: isOccupied ? "0 2px 8px rgba(239,68,68,0.08)" : "0 1px 3px rgba(16,185,129,0.08)",
                transition: "all 0.2s",
                cursor: "pointer",
                outline: "none",
                padding: 8,
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.15)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = isOccupied ? "0 2px 8px rgba(239,68,68,0.08)" : "0 1px 3px rgba(16,185,129,0.08)"}
            >
              <FaBed size={32} color={isOccupied ? "#ef4444" : "#10b981"} />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 12,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isOccupied ? "#ef4444" : "#3b82f6",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: isOccupied ? "0 2px 6px rgba(239,68,68,0.15)" : "0 1px 2px rgba(59,130,246,0.07)",
                }}
              >
                {i + 1}
              </div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: isOccupied ? "#ef4444" : "#10b981" }}>
                {isOccupied ? "Filled" : "Vacant"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="modern-room-details-glass"
      style={{
        maxWidth: 800,
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
          padding: "2rem 2.5rem 1.5rem 2.5rem",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)", marginBottom: "10px" }}>
          Logged in as: <span style={{ fontWeight: "bold" }}>{admin?.name || 'User'}</span> ({admin?.pgName || 'PG Name'})
        </div>
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
          <span className={`modern-pill-badge ${getTypeBadgeColor()}`}>
            {room?.type || 'PG'}
          </span>
          <span className="modern-pill-badge">
            <FaUsers /> {room?.occupiedBeds}/{room?.capacity} Beds
          </span>
          <span className="modern-pill-badge">
            <FaRupeeSign /> {getRentDisplay()}
          </span>
        </div>
      </div>
      <div style={{ padding: "2rem 2.5rem" }}>
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
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px 15px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
              overflowX: "auto",
            }}
          >
            {renderBedLayout()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
