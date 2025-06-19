import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Tesseract from 'tesseract.js';
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
  FaUpload,
  FaImage,
  FaHome,
  FaVideo,
  FaRedo,
  FaTimes,
  FaCamera
} from "react-icons/fa";
import { showToast } from "../utils/toast";
import { useRooms } from "../context/RoomContext";
import { useTenants } from "../context/TenantContext";

const TenantForm = ({ 
  onAadhaarData, 
  showOnlyAadhaar = false, 
  initialData = null,
  onComplete 
}) => {
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

  // OCR State
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showOcrSection, setShowOcrSection] = useState(showOnlyAadhaar);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const formRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showLiveCapture, setShowLiveCapture] = useState(false);

  // Add new state for tenant photo
  const [tenantPhoto, setTenantPhoto] = useState(null);
  const [showTenantPhotoCapture, setShowTenantPhotoCapture] = useState(false);
  const [tenantPhotoStream, setTenantPhotoStream] = useState(null);
  const tenantVideoRef = useRef(null);

  // Initialize form data with initialData if provided
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    emergencyContact: initialData?.emergencyContact || {
      name: "",
      phone: "",
      relation: "",
    },
    idProofType: initialData?.idProofType || "Aadhar",
    idProofNumber: initialData?.idProofNumber || "",
    occupation: initialData?.occupation || "",
    roomId: initialData?.roomId || preselectedRoomId || "",
    bedNumber: initialData?.bedNumber !== undefined ? Number(initialData.bedNumber) : (preselectedBedNumber ? Number(preselectedBedNumber) : ""),
    joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    active: initialData?.active !== undefined ? initialData.active : true,
    dob: initialData?.dob ? new Date(initialData.dob).toISOString().split("T")[0] : "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
  });

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
    dob,
    gender,
    address,
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
  /*
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
  */

  // Fetch tenant data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchTenantData = async () => {
        try {
          const tenant = await getTenant(id);
          if (tenant) {
            // Format dates properly
            const formattedTenant = {
              ...tenant,
              joiningDate: tenant.joiningDate ? new Date(tenant.joiningDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              bedNumber: Number(tenant.bedNumber),
              dob: tenant.dob ? new Date(tenant.dob).toISOString().split("T")[0] : "",
              roomId: tenant.roomId || "",
            };
            setFormData(formattedTenant);
          }
        } catch (error) {
          console.error("Error fetching tenant:", error);
          showToast("Failed to fetch tenant details", { type: "error" });
        } finally {
          setFetchLoading(false);
        }
      };
      fetchTenantData();
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
      let newValue = value;
      
      // Handle date fields
      if (name === "dob" || name === "joiningDate") {
        try {
          if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              newValue = value; // Keep the value directly from input, as it's already YYYY-MM-DD
            } else {
              newValue = "";
            }
          }
          // If value is empty, newValue should remain empty
          else {
            newValue = "";
          }
        } catch (error) {
          console.error("Error parsing date:", error);
          newValue = "";
        }
      }
      
      if (name === "bedNumber") {
        newValue = value === "" ? "" : Number(value);
      }
      
      // If changing room, check if the new room has capacity
      if (name === "roomId" && newValue) {
        const selectedRoom = rooms.find((r) => r._id === newValue);
        const currentTenants = getTenantsByRoom(newValue);

        if (
          selectedRoom &&
          currentTenants.length >= selectedRoom.capacity &&
          (!isEditMode || (isEditMode && formData.roomId !== newValue))
        ) {
          showToast(
            `Room ${selectedRoom.roomNumber} on Floor ${selectedRoom.floorNumber} is at full capacity`,
            { type: "error" }
          );
          return;
        }
      }

      setFormData({ ...formData, [name]: newValue });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showOnlyAadhaar) {
        if (onAadhaarData) {
          onAadhaarData(formData);
        }
        setLoading(false);
        return;
      }

      // Double-check room capacity before submitting
      if (!isEditMode || (isEditMode && formData.roomId !== id)) {
        const selectedRoom = rooms.find((r) => r._id === formData.roomId);
        const currentTenants = getTenantsByRoom(formData.roomId);

        if (selectedRoom && currentTenants.length >= selectedRoom.capacity) {
          showToast(
            `Room ${selectedRoom.roomNumber} on Floor ${selectedRoom.floorNumber} is at full capacity`,
            { type: "error" }
          );
          setLoading(false);
          return;
        }
      }

      // Format dates properly before sending to API
      const tenantData = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        joiningDate: new Date(formData.joiningDate).toISOString(),
      };

      const success = isEditMode
        ? await updateTenant(id, tenantData)
        : await addTenant(tenantData);

      if (success) {
        showToast(
          isEditMode ? "Tenant updated successfully" : "Tenant added successfully",
          { type: "success" }
        );
        if (onComplete) {
          onComplete();
        } else if (returnToRoom && preselectedRoomId) {
          navigate(`/rooms/details/${preselectedRoomId}`);
        } else {
          navigate("/tenants");
        }
      }
    } catch (err) {
      console.error("Error saving tenant:", err);
      showToast("Failed to save tenant", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e, capturedBlob = null, isTenantPhoto = false) => {
    let file = null;
    if (capturedBlob) {
      file = new File([capturedBlob], isTenantPhoto ? "tenant_photo.png" : "aadhaar_captured.png", { type: "image/png" });
    } else {
      file = e.target.files[0];
    }
    
    if (!file) return;
    
    if (isTenantPhoto) {
      setTenantPhoto(URL.createObjectURL(file));
      return;
    }
    
    setOcrLoading(true);
    setOcrImage(URL.createObjectURL(file));
    
    Tesseract.recognize(
      file,
      'eng+hin',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      const extractedData = extractAadhaarDetails(text);
      if (extractedData.idProofNumber) {
      updateFormWithAadhaarData(extractedData);
        if (onAadhaarData) {
          onAadhaarData(extractedData);
        }
        showToast("Aadhaar details extracted successfully!", { type: "success" });
      } else {
        showToast("Could not extract Aadhaar details. Please try again or enter manually.", { type: "error" });
      }
      setOcrLoading(false);
    }).catch(err => {
      console.error("OCR Error:", err);
      showToast("Failed to process Aadhaar image", { type: "error" });
      setOcrLoading(false);
    });
  };

  const startCamera = async () => {
    setCapturedImage(null);
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } });
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
      setStream(cameraStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast("Failed to access camera. Please ensure camera permissions are granted.", { type: "error" });
      setStream(null);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setCapturedImage(blob);
        handleImageUpload(null, blob);
        stopCamera();
      }, 'image/png');
    }
  };

  const cancelCapture = () => {
    stopCamera();
    setCapturedImage(null);
    setOcrImage(null);
    setShowLiveCapture(false);
  };

  const startTenantPhotoCapture = async () => {
    setTenantPhoto(null);
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (tenantVideoRef.current) {
        tenantVideoRef.current.srcObject = cameraStream;
      }
      setTenantPhotoStream(cameraStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast("Failed to access camera. Please ensure camera permissions are granted.", { type: "error" });
      setTenantPhotoStream(null);
    }
  };

  const stopTenantPhotoCapture = () => {
    if (tenantPhotoStream) {
      tenantPhotoStream.getTracks().forEach(track => track.stop());
      setTenantPhotoStream(null);
    }
  };

  const captureTenantPhoto = () => {
    if (tenantVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = tenantVideoRef.current.videoWidth;
      canvas.height = tenantVideoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(tenantVideoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        handleImageUpload(null, blob, true);
        stopTenantPhotoCapture();
        setShowTenantPhotoCapture(false);
      }, 'image/png');
    }
  };

  const cancelTenantPhotoCapture = () => {
    stopTenantPhotoCapture();
    setTenantPhoto(null);
    setShowTenantPhotoCapture(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopTenantPhotoCapture();
    };
  }, [stream, tenantPhotoStream]);

  const extractAadhaarDetails = (text) => {
    const result = {
      name: "",
      idProofNumber: "",
      dob: "",
      gender: "",
      address: ""
    };

    const cleanText = text.replace(/[^\w\s:/-]/g, " ").replace(/\s+/g, " ").trim();
    const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
    const joinedText = lines.join(" ");

    // Extract Aadhaar number (more robust regex for various formats)
    const aadhaarMatch = joinedText.match(/(\d{4}\s?\d{4}\s?\d{4})|(\d{12})/);
    if (aadhaarMatch) result.idProofNumber = aadhaarMatch[0].replace(/\s/g, "");

    // Extract DOB (DD-MM-YYYY, DD/MM/YYYY, or just year)
    const dobMatch = joinedText.match(/(?:DOB|Date of Birth|जन्म तिथि)[:\s]*(\d{2}[-/]\d{2}[-/]\d{4})|(\d{4})/i);
    if (dobMatch) {
      result.dob = dobMatch[1] || dobMatch[2];
      if (result.dob.length === 4) {
        result.dob = `${result.dob}-01-01`;
      } else {
        const parts = result.dob.split(/[-/]/);
        if (parts.length === 3) {
          result.dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }

    // Extract gender
    if (/male/i.test(joinedText)) result.gender = "Male";
    else if (/female/i.test(joinedText)) result.gender = "Female";
    else {
      const genderMatch = joinedText.match(/gender[:\s]*(male|female)/i);
      if (genderMatch) result.gender = genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1);
    }

    // Extract name (improved logic)
    const nameKeywords = [/Name/i, /नाम/i, /Father/i, /पिता/i, /Husband/i, /पति/i, /Guardian/i, /संरक्षक/i];
    let nameFound = false;
    for (let i = 0; i < lines.length; i++) {
        for (const keyword of nameKeywords) {
            if (keyword.test(lines[i])) {
                for (let j = 1; j <= 3 && (i + j) < lines.length; j++) {
                    const potentialName = lines[i + j].trim();
                    if (potentialName.length > 2 && !/\d/.test(potentialName) && !/DOB|YEAR|GENDER|ADDRESS|भारत सरकार|GOVERNMENT OF INDIA/i.test(potentialName)) {
                        result.name = potentialName;
                        nameFound = true;
        break;
      }
    }
            }
            if (nameFound) break;
        }
        if (nameFound) break;
    }
    
    if (!result.name) {
        for (const line of lines) {
            const nameGuess = line.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})$/);
            if (nameGuess && !/DOB|YEAR|GENDER|ADDRESS|AADHAAR/i.test(line)) {
                result.name = nameGuess[1];
                break;
            }
        }
    }

    // Extract address (improved logic)
    const addressKeywords = [/Address/i, /पत्ता/i, /VPO/i, /Dist/i, /PIN/i, /State/i, /City/i, /ग्राम/i, /गाँव/i];
    let potentialAddressLines = [];
    let captureAddress = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (addressKeywords.some(keyword => keyword.test(line))) {
            captureAddress = true;
            if (!/Address|पत्ता/i.test(line)) {
                potentialAddressLines.push(line);
            }
            continue;
        }
        
        if (captureAddress) {
            if (line.match(/(\d{4}\s?\d{4}\s?\d{4})|(\d{12})/) || dobMatch?.test(line) || /Name|Gender|Father|Husband|Occupation/i.test(line)) {
                captureAddress = false;
            } else if (line.length > 5) {
                potentialAddressLines.push(line.trim());
            }
        }
    }
    
    if (potentialAddressLines.length > 0) {
        result.address = potentialAddressLines.join(", ").replace(/,\s*,/g, ",").trim();
    } else {
        const addressPattern = /(\d{1,4}[,\s-]*[A-Za-z\s]+(?:[,\s-]*[A-Za-z\s]+)*(?:Road|Rd|Street|St|Marg|Merg|Colony|Nagar|Area|Sector|District|Dist|City|Village|VPO|PIN)\s*[\d-]+(?:\s*[A-Za-z\s]+)*)/i;
        const addressMatch = joinedText.match(addressPattern);
        if (addressMatch) result.address = addressMatch[1];
    }

    return result;
  };

  const updateFormWithAadhaarData = (aadhaarData) => {
    setFormData(prev => ({
      ...prev,
      name: aadhaarData.name || prev.name,
      idProofType: "Aadhar",
      idProofNumber: aadhaarData.idProofNumber || prev.idProofNumber,
      dob: aadhaarData.dob || prev.dob,
      gender: aadhaarData.gender || prev.gender,
      address: aadhaarData.address || prev.address,
    }));
    
    showToast("Aadhaar details extracted successfully!", { type: "success" });
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
      {!showOnlyAadhaar && (
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
      )}

      {/* Tenant Photo Section */}
      <div className="premium-tenant-form-section mb-6">
        <h2 className="premium-tenant-section-title">Tenant Photo</h2>
        <div className="premium-tenant-photo-upload">
          {!tenantPhoto && !showTenantPhotoCapture && (
            <div className="premium-tenant-ocr-upload flex-col md:flex-row gap-4">
              <label className="premium-tenant-ocr-label flex-grow">
                <FaUpload className="mr-2" />
                Upload Tenant Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, null, true)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowTenantPhotoCapture(true);
                  startTenantPhotoCapture();
                }}
                className="premium-tenant-ocr-label premium-tenant-live-capture-btn flex-grow"
              >
                <FaVideo className="mr-2" />
                Take Live Photo
              </button>
            </div>
          )}

          {showTenantPhotoCapture && !tenantPhoto && (
            <div className="premium-tenant-live-capture mt-4">
              <video ref={tenantVideoRef} autoPlay playsInline muted className="premium-tenant-video-feed"></video>
              <div className="premium-tenant-capture-controls mt-2 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={captureTenantPhoto}
                  className="premium-tenant-btn premium-tenant-capture-btn"
                >
                  <FaCamera className="mr-2" /> Capture
                </button>
                <button
                  type="button"
                  onClick={cancelTenantPhotoCapture}
                  className="premium-tenant-btn premium-tenant-cancel-btn"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            </div>
          )}

          {tenantPhoto && (
            <div className="premium-tenant-ocr-preview mt-4">
              <img src={tenantPhoto} alt="Tenant Photo" />
              <div className="premium-tenant-capture-controls mt-2 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTenantPhoto(null);
                    setShowTenantPhotoCapture(true);
                    startTenantPhotoCapture();
                  }}
                  className="premium-tenant-btn premium-tenant-retake-btn"
                >
                  <FaRedo className="mr-2" /> Take Again
                </button>
                <button
                  type="button"
                  onClick={cancelTenantPhotoCapture}
                  className="premium-tenant-btn premium-tenant-cancel-btn"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aadhaar Section */}
        <div className="premium-tenant-ocr-section mb-6">
          <button
            type="button"
            onClick={() => setShowOcrSection(!showOcrSection)}
            className="premium-tenant-ocr-toggle"
          >
            <FaImage className="mr-2" />
            {showOcrSection ? 'Hide Aadhaar Scan' : 'Scan Aadhaar Card'}
          </button>

          {showOcrSection && (
            <div className="premium-tenant-ocr-container mt-4">
            <div className="premium-tenant-ocr-upload flex-col md:flex-row gap-4">
              <label className="premium-tenant-ocr-label flex-grow">
                <FaUpload className="mr-2" />
                Upload Aadhaar Card Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, null, false)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowLiveCapture(true);
                  startCamera();
                }}
                className="premium-tenant-ocr-label premium-tenant-live-capture-btn flex-grow"
              >
                <FaVideo className="mr-2" />
                Capture Aadhaar Card
              </button>
            </div>

            {showLiveCapture && !capturedImage && (
              <div className="premium-tenant-live-capture mt-4">
                <video ref={videoRef} autoPlay playsInline muted className="premium-tenant-video-feed"></video>
                <div className="premium-tenant-capture-controls mt-2 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="premium-tenant-btn premium-tenant-capture-btn"
                  >
                    <FaCamera className="mr-2" /> Capture
                  </button>
                  <button
                    type="button"
                    onClick={cancelCapture}
                    className="premium-tenant-btn premium-tenant-cancel-btn"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="premium-tenant-ocr-preview mt-4">
                <img src={URL.createObjectURL(capturedImage)} alt="Captured Aadhaar" />
                <div className="premium-tenant-capture-controls mt-2 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setOcrImage(null);
                      startCamera();
                    }}
                    className="premium-tenant-btn premium-tenant-retake-btn"
                  >
                    <FaRedo className="mr-2" /> Capture Again
                  </button>
                  <button
                    type="button"
                    onClick={cancelCapture}
                    className="premium-tenant-btn premium-tenant-cancel-btn"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              </div>
            )}

                {ocrLoading && (
                <div className="premium-tenant-ocr-loading mt-4">
                    <div className="premium-tenant-ocr-spinner"></div>
                    <span>Processing Aadhaar Card...</span>
                  </div>
                )}
            {ocrImage && !ocrLoading && !showLiveCapture && (
              <div className="premium-tenant-ocr-preview mt-4">
                  <img src={ocrImage} alt="Aadhaar Preview" />
                  <p className="premium-tenant-ocr-note">
                    Review extracted details below and edit if needed
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      {!showOnlyAadhaar && preselectedRoomId && (
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
              {/* Always show these fields, even in edit mode */}
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
                <label htmlFor="occupation" className="premium-tenant-form-label">
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
                <label htmlFor="idProofType" className="premium-tenant-form-label">
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
                <label htmlFor="idProofNumber" className="premium-tenant-form-label">
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
                <label htmlFor="dob" className="premium-tenant-form-label">
                  <FaCalendarAlt className="inline-block mr-2" /> Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob || ""}
                  onChange={onChange}
                  className="premium-tenant-form-input"
                  max={new Date().toISOString().split("T")[0]}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="premium-tenant-form-group">
                <label htmlFor="gender" className="premium-tenant-form-label">
                  <FaUserFriends className="inline-block mr-2" /> Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={onChange}
                  className="premium-tenant-form-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="premium-tenant-form-group col-span-2">
                <label htmlFor="address" className="premium-tenant-form-label">
                  <FaHome className="inline-block mr-2" /> Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={address}
                  onChange={onChange}
                  rows="3"
                  className="premium-tenant-form-input"
                  placeholder="Enter full address"
                ></textarea>
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
                  className="premium-tenant-form-select"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      Floor {room.floorNumber}, Room {room.roomNumber}
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
                    value={bedNumber.toString()}
                    onChange={onChange}
                    className="premium-tenant-form-select"
                    required
                  >
                    <option value="">Select a bed</option>
                    {roomId && rooms.find(r => r._id === roomId) &&
                      Array.from({ length: rooms.find(r => r._id === roomId).capacity }, (_, i) => {
                        const selectedRoom = rooms.find(r => r._id === roomId);
                        const roomTenants = getTenantsByRoom(roomId);
                        const isBedOccupied = roomTenants.some(
                          tenant => tenant.bedNumber === (i+1) && 
                            (!isEditMode || (isEditMode && tenant._id !== id))
                        );
                        return (
                          <option
                            key={i+1}
                            value={(i+1).toString()}
                            disabled={isBedOccupied}
                          >
                            Bed {i+1} {isBedOccupied ? '(Occupied)' : ''}
                            {isEditMode && (i+1) === bedNumber ? ' (Current)' : ''}
                          </option>
                        );
                      })
                    }
                  </select>
                </div>
              )}

              <div className="premium-tenant-form-group">
                <label htmlFor="joiningDate" className="premium-tenant-form-label">
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
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="premium-tenant-form-footer">
              <button
                type="submit"
                disabled={loading || (!tenantPhoto && !showOnlyAadhaar)}
                className="premium-tenant-submit-btn"
              >
                <FaSave className="mr-2" />
                {loading
                  ? "Saving..."
                  : showOnlyAadhaar
                  ? "Continue with Aadhaar Details"
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