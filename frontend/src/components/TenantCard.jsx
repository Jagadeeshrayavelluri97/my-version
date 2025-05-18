import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaIdCard,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaBed,
} from "react-icons/fa";
import { useRooms } from "../context/RoomContext";

const TenantCard = ({ tenant, onDelete }) => {
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading } = useRooms();
  const {
    _id,
    name,
    phone,
    email,
    roomId,
    joiningDate,
    active,
    idProofType,
    occupation,
  } = tenant;
  const room = rooms.find((r) => r._id === roomId);
  const floorNumber = room ? room.floorNumber : "-";
  const roomNumber = room ? room.roomNumber : "-";
  const formattedDate = new Date(joiningDate).toLocaleDateString();
  if (roomsLoading) {
    return (
      <div className="ultra-card tenant-card-green compact-tenant-card">
        <div className="ultra-card-body" style={{padding: '1.2rem'}}>
          <div>Loading room details...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="ultra-card tenant-card-green compact-tenant-card">
      <div className="ultra-card-header tenant-header-gradient" style={{padding: '1.1rem 1.2rem 0.7rem 1.2rem'}}>
        <div className="ultra-avatar-ring" style={{width: 38, height: 38, minWidth: 38, minHeight: 38, marginBottom: 0}}>
          <div className="ultra-avatar" style={{width: 32, height: 32, fontSize: '1.3rem'}}>
            <FaUser />
          </div>
        </div>
        <div className="ultra-card-title-row" style={{gap: 0, marginBottom: 2}}>
          <span className="ultra-card-title" style={{fontSize: '1.05rem'}}>{name}</span>
          <span className={`ultra-status-badge ${active ? "active" : "inactive"}`} style={{fontSize: '0.8rem', padding: '0.22rem 0.7rem'}}>{active ? <FaCheckCircle /> : <FaTimesCircle />} {active ? "Active" : "Inactive"}</span>
        </div>
        <div style={{display: 'flex', gap: 6, marginTop: 6}}>
          <span className="modern-pill-badge" style={{fontSize: 12, padding: '2px 8px'}}><FaBuilding style={{marginRight: 4}} /> Floor {floorNumber || '-'}</span>
          <span className="modern-pill-badge" style={{fontSize: 12, padding: '2px 8px'}}><FaBed style={{marginRight: 4}} /> Room {roomNumber || '-'}</span>
        </div>
      </div>
      <div className="ultra-card-body" style={{padding: '0.8rem 1.2rem 0.7rem 1.2rem', gap: '0.5rem'}}>
        <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaBuilding className="ultra-info-icon" /> <span>Floor: {floorNumber || '-'}</span></div>
        <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaBed className="ultra-info-icon" /> <span>Room: {roomNumber || '-'}</span></div>
        <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaPhone className="ultra-info-icon" /> <span>{phone}</span></div>
        {email && <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaEnvelope className="ultra-info-icon" /> <span>{email}</span></div>}
        <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaCalendarAlt className="ultra-info-icon" /> <span>Joined: {formattedDate}</span></div>
        {idProofType && <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaIdCard className="ultra-info-icon" /> <span>ID: {idProofType}</span></div>}
        {occupation && <div className="ultra-info-row" style={{padding: '0.5rem 0.7rem', fontSize: 13}}><FaBriefcase className="ultra-info-icon" /> <span>{occupation}</span></div>}
      </div>
      <div className="ultra-card-actions" style={{padding: '0.6rem 1.2rem', gap: '0.5rem'}}>
        <button className="ultra-btn ultra-btn-edit" style={{fontSize: 13, padding: '0.45rem 1rem'}} onClick={() => navigate(`/tenants/edit/${_id}`)}><FaEdit /> Edit</button>
        <button className="ultra-btn ultra-btn-delete" style={{fontSize: 13, padding: '0.45rem 1rem'}} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (window.confirm("Are you sure you want to delete this tenant?")) onDelete(_id); }}><FaTrash /> Delete</button>
      </div>
    </div>
  );
};

export default TenantCard;
