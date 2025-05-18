import React from "react";
import { FaTimes } from "react-icons/fa";
import RoomDetails from "../pages/RoomDetails";

const modalStyles = `
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 900px;
  width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  z-index: 10;
}
`;

const RoomDetailsModal = ({ room, onClose }) => {
  return (
    <>
      <style>{modalStyles}</style>
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
          {/* You can reuse RoomDetails or create a RoomDetailsContent component for modal */}
          <RoomDetails roomProp={room} isModal />
        </div>
      </div>
    </>
  );
};

export default RoomDetailsModal; 