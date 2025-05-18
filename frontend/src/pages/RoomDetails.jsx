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

  useEffect(() => {
    if (roomProp) {
      setRoom(roomProp);
      setRoomTenants(tenants.filter((t) => t.roomId === roomProp._id));
    } else {
      const foundRoom = rooms.find((r) => r._id === id);
      setRoom(foundRoom || null);
      setRoomTenants(tenants.filter((t) => t.roomId === id));
    }
  }, [id, rooms, tenants, roomProp]);

  const handleAddTenant = () => {
    navigate(`/tenants/add?roomId=${id}&returnToRoom=true`);
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      await deleteTenant(tenantId);
    }
  };

  if (roomsLoading || tenantsLoading) {
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

  return (
    <div className="modern-room-details-glass" style={{ maxWidth: 520, margin: '2.5rem auto', borderRadius: 22, boxShadow: '0 8px 32px rgba(80,80,120,0.13)', overflow: 'hidden', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', position: 'relative' }}>
      <div className="modern-room-details-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', padding: '1.5rem 2rem 1rem 2rem', borderTopLeftRadius: 22, borderTopRightRadius: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaBed style={{ fontSize: 24 }} />
            <span style={{ fontWeight: 700, fontSize: 20 }}>Room {room?.roomNumber}</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: room?.occupiedBeds < room?.capacity ? '#10b981' : '#ef4444', color: 'white', borderRadius: 8, padding: '2px 12px', fontSize: 14, fontWeight: 600 }}>
            {room?.occupiedBeds < room?.capacity ? <FaCheckCircle /> : <FaTimesCircle />} {room?.occupiedBeds < room?.capacity ? 'Vacant' : 'Full'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <span className="modern-pill-badge"><FaBuilding /> Floor {room?.floorNumber}</span>
          <span className="modern-pill-badge"><FaUsers /> {room?.occupiedBeds}/{room?.capacity} Beds</span>
          <span className="modern-pill-badge"><FaRupeeSign /> {room?.rent}</span>
        </div>
      </div>
      <div style={{ padding: '1.2rem 2rem 1.2rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <FaListUl style={{ color: '#6366f1', fontSize: 18 }} />
          <span style={{ fontWeight: 600, fontSize: 16, color: '#22223b' }}>Amenities</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          {room?.amenities && room.amenities.length > 0 ? room.amenities.map((a) => (
            <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', borderRadius: 8, padding: '5px 12px', fontSize: 14, color: '#6366f1', fontWeight: 500 }}>
              {amenityIcons[a] || <FaListUl />} {a}
            </span>
          )) : <span style={{ color: '#aaa' }}>No amenities listed</span>}
        </div>
        {/* Bed Layout Section */}
        <div style={{ marginTop: 18, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#6366f1', letterSpacing: 0.01 }}>Bed Layout</span>
            <button
              className="modern-btn modern-btn-edit"
              style={{ minWidth: 90, fontSize: 13, padding: '0.4rem 1rem' }}
              onClick={() => setEditBeds((v) => !v)}
            >
              {editBeds ? 'Done' : 'Edit'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            {beds.map((bed, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                <FaBed
                  style={{
                    fontSize: 24,
                    color: bed.tenant ? '#6366f1' : '#cbd5e1',
                    filter: bed.tenant ? 'drop-shadow(0 2px 6px #6366f1aa)' : 'none',
                    borderRadius: 8,
                    background: editBeds ? '#f3f4f6' : 'none',
                    cursor: editBeds ? 'pointer' : 'default',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  title={bed.tenant ? 'Occupied' : 'Vacant'}
                  onClick={editBeds ? () => alert('Edit bed/tenant feature coming soon!') : undefined}
                />
                <span style={{ fontSize: 12, color: bed.tenant ? '#22223b' : '#aaa', marginTop: 2, fontWeight: 500, textAlign: 'center', minHeight: 16 }}>
                  {bed.tenant ? bed.tenant.name : 'Vacant'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Sticky/Floating Action Bar */}
      <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0.7rem 2rem', zIndex: 10 }}>
        <button className="modern-btn modern-btn-edit" onClick={() => navigate(`/rooms/edit/${room._id}`)}><FaEdit /> Edit Room</button>
        <button className="modern-btn modern-btn-delete" onClick={() => { if(window.confirm('Are you sure you want to delete this room?')) { /* delete logic here */ }}}><FaTrash /> Delete Room</button>
        <button className="modern-btn modern-btn-add" onClick={handleAddTenant}><FaUserPlus /> Add Tenant</button>
      </div>
    </div>
  );
};

export default RoomDetails;
