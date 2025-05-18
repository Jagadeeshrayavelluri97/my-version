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
  return (
    <div className="ultra-card room-card-blue compact-room-card">
      <div className="ultra-card-header room-header-gradient" style={{padding: '1.1rem 1.2rem 0.7rem 1.2rem'}}>
        <div style={{display: 'flex', alignItems: 'center', width: '100%', gap: 12}}>
          <div className="ultra-avatar-ring" style={{width: 38, height: 38, minWidth: 38, minHeight: 38, marginBottom: 0}}>
            <div className="ultra-avatar" style={{width: 32, height: 32, fontSize: '1.3rem'}}>
              <FaBed />
            </div>
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'}}>
              <span className="ultra-card-title" style={{fontSize: '1.05rem'}}>Room {roomNumber}</span>
              <span
                className={`ultra-status-badge ${isVacant ? "vacant-badge-green" : "inactive"}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.22rem 0.7rem',
                  background: isVacant ? '#22c55e' : undefined,
                  color: isVacant ? 'white' : undefined,
                }}
              >
                {isVacant ? <FaCheckCircle /> : <FaTimesCircle />} {isVacant ? "Vacant" : "Full"}
              </span>
            </div>
            <div style={{display: 'flex', gap: 6, marginTop: 6}}>
              <span className="modern-pill-badge" style={{fontSize: 12, padding: '2px 8px'}}><FaBuilding style={{marginRight: 4}} /> Floor {floorNumber}</span>
              <span className="modern-pill-badge" style={{fontSize: 12, padding: '2px 8px'}}><FaRupeeSign style={{marginRight: 4}} /> {rentAmount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ultra-card-body" style={{padding: '0.8rem 1.2rem 0.7rem 1.2rem', gap: '0.5rem'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.3rem'}}>
          <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaUsers className="ultra-info-icon" /> <span>Capacity: {occupiedBeds}/{capacity}</span></div>
          <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaRupeeSign className="ultra-info-icon" /> <span>Rent: {rentAmount}</span></div>
        </div>
        <div className="ultra-info-row" style={{marginBottom: 0, padding: '0.5rem 0.7rem', fontSize: 13}}><FaListUl className="ultra-info-icon" /> <span>Amenities: {amenities.length > 0 ? amenities.join(', ') : 'None'}</span></div>
      </div>
      <div className="ultra-card-actions" style={{padding: '0.6rem 1.2rem', gap: '0.5rem'}}>
        <button className="ultra-btn ultra-btn-edit" style={{fontSize: 13, padding: '0.45rem 1rem'}} onClick={() => navigate(`/rooms/edit/${_id}`)}><FaEdit /> Edit</button>
        <button className="ultra-btn ultra-btn-delete" style={{fontSize: 13, padding: '0.45rem 1rem'}} onClick={(e) => { e.stopPropagation(); if (window.confirm("Are you sure you want to delete this room?")) onDelete(_id); }}><FaTrash /> Delete</button>
      </div>
    </div>
  );
};

export default RoomCard;
