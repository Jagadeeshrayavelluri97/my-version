import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaSave,
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaToggleOn,
  FaUserFriends,
  FaInfoCircle,
  FaCheckCircle,
  FaBed,
} from "react-icons/fa";
import { showToast } from "../utils/toast";
import { useRooms } from "../context/RoomContext";
import { useTenants } from "../context/TenantContext";

const TenantForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  // Get room and tenant context
  const { rooms, loading: roomsLoading } = useRooms();
  const { addTenant, updateTenant, getTenant, getTenantsByRoom } = useTenants();

  // Get parameters from URL query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const preselectedRoomId = queryParams.get("roomId");
  const preselectedBedNumber = queryParams.get("bedNumber");
  const returnToRoom = queryParams.get("returnToRoom") === "true";

  // Check if preselected room has capacity when component mounts
  useEffect(() => {
    if (!isEditMode && preselectedRoomId && rooms.length > 0) {
      const selectedRoom = rooms.find((r) => r._id === preselectedRoomId);
      const currentTenants = getTenantsByRoom(preselectedRoomId);

      if (selectedRoom && currentTenants.length >= selectedRoom.capacity) {
        showToast(
          `Room ${selectedRoom.roomNumber} on Floor ${selectedRoom.floorNumber} is at full capacity`,
          { type: "error" },
          location
        );

        // Redirect back to room details
        if (returnToRoom) {
          setTimeout(() => {
            navigate(`/rooms/details/${preselectedRoomId}`);
          }, 1500);
        }
      }
    }
  }, [
    rooms,
    preselectedRoomId,
    isEditMode,
    getTenantsByRoom,
    navigate,
    returnToRoom,
    location,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    idProofType: "Aadhar",
    idProofNumber: "",
    occupation: "",
    roomId: preselectedRoomId || "",
    bedNumber: preselectedBedNumber || "",
    joiningDate: new Date().toISOString().split("T")[0],
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const formRef = useRef(null);

  const {
    name,
    email,
    phone,
    emergencyContact,
    idProofType,
    idProofNumber,
    occupation,
    roomId,
    bedNumber,
    joiningDate,
    active,
  } = formData;

  const idProofTypes = [
    "Aadhar",
    "PAN",
    "Driving License",
    "Passport",
    "Voter ID",
    "Other",
  ];

  // Animation effect for form fields
  useEffect(() => {
    if (!fetchLoading && formRef.current) {
      const formGroups = formRef.current.querySelectorAll(
        ".premium-tenant-form-group"
      );

      formGroups.forEach((group, index) => {
        group.style.opacity = "0";
        group.style.transform = "translateY(20px)";
        group.style.transition = "all 0.4s ease";

        setTimeout(() => {
          group.style.opacity = "1";
          group.style.transform = "translateY(0)";
        }, 100 + index * 50); // Staggered animation
      });
    }
  }, [fetchLoading]);

  // Fetch tenant data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const tenant = getTenant(id);
      if (tenant) {
        setFormData({
          ...tenant,
          joiningDate: new Date(tenant.joiningDate).toISOString().split("T")[0],
        });
      }
      setFetchLoading(false);
    }
  }, [id, isEditMode, getTenant]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("emergency")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...emergencyContact,
          [field]: value,
        },
      });
    } else {
      // If changing room, check if the new room has capacity
      if (name === "roomId" && value) {
        const selectedRoom = rooms.find((r) => r._id === value);
        const currentTenants = getTenantsByRoom(value);

        // If room is at capacity and we're not editing an existing tenant in this room
        if (
          selectedRoom &&
          currentTenants.length >= selectedRoom.capacity &&
          (!isEditMode || (isEditMode && formData.roomId !== value))
        ) {
          showToast(
            `Room ${selectedRoom.roomNumber} on Floor ${selectedRoom.floorNumber} is at full capacity`,
            { type: "error" },
            location
          );

          // Don't update the form with the full room
          return;
        }
      }

      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Double-check room capacity before submitting (in case it changed while form was open)
      if (!isEditMode || (isEditMode && formData.roomId !== id)) {
        const selectedRoom = rooms.find((r) => r._id === formData.roomId);
        const currentTenants = getTenantsByRoom(formData.roomId);

        if (selectedRoom && currentTenants.length >= selectedRoom.capacity) {
          showToast(
            `Room ${selectedRoom.roomNumber} on Floor ${selectedRoom.floorNumber} is at full capacity`,
            { type: "error" },
            location
          );
          setLoading(false);
          return;
        }
      }

      const success = isEditMode
        ? await updateTenant(id, formData)
        : await addTenant(formData);

      if (success) {
        if (returnToRoom && preselectedRoomId) {
          navigate(`/rooms/details/${preselectedRoomId}`);
        } else {
          navigate("/tenants");
        }
      }
    } catch (err) {
      console.error("Error saving tenant:", err);
      showToast("Failed to save tenant", { type: "error" }, location);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading || roomsLoading) {
    return (
      <div className="premium-tenant-loading">
        <div className="premium-tenant-spinner"></div>
      </div>
    );
  }

  return (
    <div className="premium-tenant-container">
      <div className="premium-tenant-header">
        <h1 className="premium-tenant-title">
          {isEditMode ? "Edit Tenant" : "Add New Tenant"}
        </h1>
        <button
          onClick={() => navigate("/tenants")}
          className="premium-tenant-back"
        >
          <FaArrowLeft className="premium-tenant-back-icon" /> Back to Tenants
        </button>
      </div>

      {preselectedRoomId && (
        <div className="premium-tenant-alert">
          <div className="flex items-center">
            <FaCheckCircle className="mr-2" size={18} />
            <div>
              <p className="premium-tenant-alert-title">
                Room pre-selected from Rooms page
              </p>
              <p className="premium-tenant-alert-text">
                You can change the room if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="premium-tenant-form-card">
        <div className="premium-tenant-form-body">
          <form onSubmit={onSubmit} ref={formRef}>
            <div className="premium-tenant-form-grid">
              <div className="premium-tenant-form-group">
                <label htmlFor="name" className="premium-tenant-form-label">
                  <FaUser className="inline-block mr-2" /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  required
                  placeholder="Enter tenant's full name"
                />
              </div>

              <div className="premium-tenant-form-group">
                <label htmlFor="email" className="premium-tenant-form-label">
                  <FaEnvelope className="inline-block mr-2" /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  placeholder="Enter email address (optional)"
                />
              </div>

              <div className="premium-tenant-form-group">
                <label htmlFor="phone" className="premium-tenant-form-label">
                  <FaPhone className="inline-block mr-2" /> Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  required
                  placeholder="Enter phone number"
                />
              </div>

              <div className="premium-tenant-form-group">
                <label
                  htmlFor="occupation"
                  className="premium-tenant-form-label"
                >
                  <FaBriefcase className="inline-block mr-2" /> Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={occupation}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  placeholder="Enter occupation (optional)"
                />
              </div>

              <div className="premium-tenant-form-group">
                <label
                  htmlFor="idProofType"
                  className="premium-tenant-form-label"
                >
                  <FaIdCard className="inline-block mr-2" /> ID Proof Type
                </label>
                <select
                  id="idProofType"
                  name="idProofType"
                  value={idProofType}
                  onChange={onChange}
                  className="premium-tenant-form-select"
                  required
                >
                  {idProofTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="premium-tenant-form-group">
                <label
                  htmlFor="idProofNumber"
                  className="premium-tenant-form-label"
                >
                  <FaIdCard className="inline-block mr-2" /> ID Proof Number
                </label>
                <input
                  type="text"
                  id="idProofNumber"
                  name="idProofNumber"
                  value={idProofNumber}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  required
                  placeholder="Enter ID proof number"
                />
              </div>

              <div className="premium-tenant-form-group">
                <label htmlFor="roomId" className="premium-tenant-form-label">
                  <FaBuilding className="inline-block mr-2" /> Room
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  value={roomId}
                  onChange={onChange}
                  className={`premium-tenant-form-select ${
                    preselectedRoomId ? "border-green-500 bg-green-50" : ""
                  }`}
                  required
                  style={{
                    transition: "all 0.3s ease",
                    borderColor: preselectedRoomId ? "#10b981" : "",
                    boxShadow: preselectedRoomId
                      ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                      : "",
                  }}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option
                      key={room._id}
                      value={room._id}
                      disabled={
                        room.occupiedBeds >= room.capacity &&
                        room._id !== roomId
                      }
                    >
                      Floor {room.floorNumber}, Room {room.roomNumber}
                      {room.occupiedBeds > 0
                        ? ` (${room.occupiedBeds}/${room.capacity} occupied)`
                        : " (Vacant)"}
                      {room._id === preselectedRoomId
                        ? " ← Selected from Rooms page"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {roomId && (
                <div className="premium-tenant-form-group">
                  <label htmlFor="bedNumber" className="premium-tenant-form-label">
                    <FaBed className="inline-block mr-2" /> Bed Number
                  </label>
                  <select
                    id="bedNumber"
                    name="bedNumber"
                    value={bedNumber}
                    onChange={onChange}
                    className={`premium-tenant-form-select ${
                      preselectedBedNumber ? "border-green-500 bg-green-50" : ""
                    }`}
                    required
                    style={{
                      transition: "all 0.3s ease",
                      borderColor: preselectedBedNumber ? "#10b981" : "",
                      boxShadow: preselectedBedNumber
                        ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                        : "",
                    }}
                  >
                    <option value="">Select a bed</option>
                    {roomId && rooms.find(r => r._id === roomId) &&
                      Array.from({ length: rooms.find(r => r._id === roomId).capacity }, (_, i) => {
                        // Check if this bed is already occupied by another tenant
                        const selectedRoom = rooms.find(r => r._id === roomId);
                        const roomTenants = getTenantsByRoom(roomId);
                        const isBedOccupied = roomTenants.some(
                          tenant => tenant.bedNumber === (i+1) && (!isEditMode || tenant._id !== id)
                        );

                        return (
                          <option
                            key={i+1}
                            value={i+1}
                            disabled={isBedOccupied}
                          >
                            Bed {i+1} {isBedOccupied ? '(Occupied)' : ''}
                          </option>
                        );
                      })
                    }
                  </select>
                </div>
              )}

              <div className="premium-tenant-form-group">
                <label
                  htmlFor="joiningDate"
                  className="premium-tenant-form-label"
                >
                  <FaCalendarAlt className="inline-block mr-2" /> Joining Date
                </label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={joiningDate}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  required
                />
              </div>

              {isEditMode && (
                <div className="premium-tenant-form-group">
                  <label htmlFor="active" className="premium-tenant-form-label">
                    <FaToggleOn className="inline-block mr-2" /> Status
                  </label>
                  <select
                    id="active"
                    name="active"
                    value={active.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.value === "true",
                      })
                    }
                    className="premium-tenant-form-select"
                    style={{
                      borderColor: active ? "#10b981" : "#ef4444",
                      backgroundColor: active
                        ? "rgba(16, 185, 129, 0.05)"
                        : "rgba(239, 68, 68, 0.05)",
                    }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="premium-tenant-form-footer">
              <button
                type="submit"
                disabled={loading}
                className="premium-tenant-submit-btn"
              >
                <FaSave className="mr-2" />
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Tenant"
                  : "Add Tenant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantForm;
