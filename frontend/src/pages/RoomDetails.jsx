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
      // Check if tenant has a bedNumber and it's within the room capacity
      if (tenant.bedNumber && tenant.bedNumber <= room.capacity) {
        // Beds are 1-indexed in the UI but 0-indexed in the array
        const bedIndex = tenant.bedNumber - 1;
        occupiedBedMap[bedIndex] = true;
        bedTenants[bedIndex] = tenant;
      }
    });

    const beds = [];
    for (let i = 0; i < room.capacity; i++) {
      const isOccupied = occupiedBedMap[i];
      const tenant = bedTenants[i];

      beds.push(
        <div
          key={i}
          className={`bed-item ${isOccupied ? "occupied" : "vacant"}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            width: "180px",
            height: "280px",
            margin: "10px",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: isOccupied ? "#ef4444" : "#10b981",
            backgroundColor: isOccupied
              ? "#ffebeb"
              : "#e6fff5",
            boxShadow: isOccupied
              ? "0 2px 8px rgba(239, 68, 68, 0.15)"
              : "0 1px 3px rgba(0,0,0,0.05)",
            padding: "20px 15px",
            position: "relative",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onClick={isOccupied ? () => navigate(`/tenants/edit/${tenant._id}`) : () => handleAddTenant(i+1)}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
          }}>
            <FaBed
              size={32}
              color={isOccupied ? "#ef4444" : "#10b981"}
              style={{ marginBottom: "12px" }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: isOccupied ? "#ef4444" : "#10b981",
                marginBottom: "6px",
              }}
            >
              Bed {i + 1}
            </span>
            <span
              style={{
                fontSize: "15px",
                color: isOccupied ? "#ef4444" : "#10b981",
                marginBottom: "15px",
                fontWeight: "500",
              }}
            >
              {isOccupied ? "Occupied" : "Vacant"}
            </span>
          </div>

          {isOccupied && tenant && (
            <div style={{
              width: "100%",
              padding: "12px 15px",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "10px",
              margin: "10px 0",
              border: "1px solid #e0e0e0",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "0",
              }}>
                {tenant.name}
              </div>
            </div>
          )}

          <div style={{ width: "100%", marginTop: "auto", display: "flex", gap: "10px" }}>
            {isOccupied ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tenants/edit/${tenant._id}`);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    fontSize: "14px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.3px",
                  }}
                  title="Edit Tenant Details"
                >
                  <FaEdit style={{ marginRight: "8px", fontSize: "15px" }} /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTenant(tenant._id);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    fontSize: "14px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.3px",
                  }}
                  title="Remove Tenant from Bed"
                >
                  <FaTrash style={{ marginRight: "8px", fontSize: "15px" }} /> Remove
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTenant(i+1);
                }}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  fontSize: "14px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.3px",
                }}
                title="Add Tenant to Bed"
              >
                <FaUserPlus style={{ marginRight: "8px", fontSize: "15px" }} /> Add
              </button>
            )}
          </div>
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
          gap: "25px",
        }}
      >
        {beds}

        {/* Room action buttons - always visible */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "35px",
            padding: "20px 0",
            borderTop: "1px solid #e5e7eb",
            gap: "20px",
          }}
        >
          <button
            onClick={() => navigate(`/rooms/edit/${room._id}`)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#3b82f6",
              fontSize: "14px",
              fontWeight: "600",
              padding: "12px 24px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              minWidth: "120px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FaEdit style={{ fontSize: "24px", marginBottom: "10px" }} />
            Edit
          </button>
          <button
            onClick={handleDeleteRoom}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: "600",
              padding: "12px 24px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              minWidth: "120px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FaTrash style={{ fontSize: "24px", marginBottom: "10px" }} />
            Delete
          </button>
          <button
            onClick={handleAddTenant}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#10b981",
              fontSize: "14px",
              fontWeight: "600",
              padding: "12px 24px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              minWidth: "120px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FaUserPlus style={{ fontSize: "24px", marginBottom: "10px" }} />
            Add
          </button>
        </div>
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
          <span className="modern-pill-badge">
            <FaUsers /> {room?.occupiedBeds}/{room?.capacity} Beds
          </span>
          <span className="modern-pill-badge">
            <FaRupeeSign /> {room?.rentAmount}
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
