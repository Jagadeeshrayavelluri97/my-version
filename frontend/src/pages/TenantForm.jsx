import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Tesseract from 'tesseract.js';
import api from '../utils/api';
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
  onComplete,
  formMode = "full" // New prop: "full", "tenantPhotoCapture", "aadhaarUpload", "additionalDetails"
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
  const preselectedBedName = queryParams.get("bedName");
  const returnToRoom = queryParams.get("returnToRoom") === "true";

  // OCR State
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showOcrSection, setShowOcrSection] = useState(showOnlyAadhaar || formMode === "aadhaarUpload");
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
  const [capturedTenantPhotoPreview, setCapturedTenantPhotoPreview] = useState(null);
  const [showTenantPhotoUploadInput, setShowTenantPhotoUploadInput] = useState(false);
  const tenantVideoRef = useRef(null);
  const [tenantPhotoStream, setTenantPhotoStream] = useState(null);

  // Add new state for Aadhaar photo capture/upload
  const [capturedAadhaarPhotoPreview, setCapturedAadhaarPhotoPreview] = useState(null);
  const [showAadhaarCapture, setShowAadhaarCapture] = useState(false);
  const [showAadhaarUploadInput, setShowAadhaarUploadInput] = useState(false);
  const [aadhaarInputMode, setAadhaarInputMode] = useState(null); // 'upload', 'camera', or null for initial choice

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
    bedName: initialData?.bedName || preselectedBedName || "",
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
    bedName,
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
              bedName: tenant.bedName || "",
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
      
      if (name === "bedName") {
        newValue = value; // Keep as string
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
      if (formMode === "aadhaarUpload") {
        // The onAadhaarData is called by handleImageUpload when OCR completes. 
        // So, when this onSubmit is called, it means the user clicked "Continue".
        // We should ensure all required Aadhaar fields are filled before proceeding.
        const requiredAadhaarFields = ['name', 'idProofNumber', 'dob', 'gender', 'address'];
        const allAadhaarFieldsFilled = requiredAadhaarFields.every(field => formData[field] && formData[field].toString().trim() !== '');

        if (ocrImage && allAadhaarFieldsFilled) {
          if (onComplete) {
            onComplete(formData);
          }
        } else if (!ocrImage) {
          showToast("Please upload an Aadhaar image first.", { type: "error" });
        } else {
          showToast("Please ensure all Aadhaar details (Name, Aadhaar No., DOB, Gender, Address) are filled before continuing.", { type: "error" });
        }
        setLoading(false);
        return;
      }

      if (formMode === "tenantPhotoCapture") {
        if (tenantPhoto && onComplete) {
          onComplete(tenantPhoto);
        }
        setLoading(false);
        return;
      }

      if (formMode === "additionalDetails") {
        if (onComplete) {
          onComplete(formData);
        }
        setLoading(false);
        return;
      }

      // Original form submission logic for full mode or edit mode
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

      const tenantData = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        joiningDate: new Date(formData.joiningDate).toISOString(),
        bedName: formData.bedName,
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
    } else if (e && e.target && e.target.files && e.target.files[0]) {
      file = e.target.files[0];
    }
    
    if (!file) {
        console.error("No file or captured blob provided to handleImageUpload.");
        showToast("Failed to process image: No valid image data.", { type: "error" });
        return;
    }
    
    // Logic for Tenant Photo
    if (isTenantPhoto) {
      const photoUrl = URL.createObjectURL(file);
      setTenantPhoto(photoUrl); // Store the actual photo URL
      setCapturedTenantPhotoPreview(photoUrl); // Set the URL for preview
      // Do NOT call onComplete here. It will be called on 'Confirm Photo'
      return; // Stop processing further for tenant photos
    }
    
    // Logic for Aadhaar Card (isTenantPhoto is false)
    setOcrLoading(true);
    // Set Aadhaar preview immediately after file selection/capture
    const aadhaarPreviewUrl = URL.createObjectURL(file);
    setCapturedAadhaarPhotoPreview(aadhaarPreviewUrl);
    
    const formData = new FormData();
    formData.append('aadhaarImage', file);

    api.post('/tenants/aadhaar-ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      const extractedData = response.data.data;
      console.log("Extracted Aadhaar Data:", extractedData);
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
      // Do NOT call onComplete immediately for Aadhaar. User will confirm after reviewing extracted data.
    }).catch(err => {
      console.error("Aadhaar OCR Error:", err);
      showToast(err.response?.data?.error || "Failed to process Aadhaar image", { type: "error" });
      setOcrLoading(false);
      setCapturedAadhaarPhotoPreview(null); // Clear preview on error
      // Also clear any partially extracted data if the OCR fails
      setFormData(prev => ({
        ...prev,
        name: "",
        idProofNumber: "",
        dob: "",
        gender: "",
        address: "",
      }));
    });
  };

  const startCamera = async () => {
    setCapturedAadhaarPhotoPreview(null);
    setOcrImage(null);
    setOcrLoading(false);
    setShowAadhaarUploadInput(false);
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
      setStream(cameraStream);
      setShowAadhaarCapture(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast("Failed to access camera. Please ensure camera permissions are granted.", { type: "error" });
      setStream(null);
      setShowAadhaarCapture(false);
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
        const aadhaarPhotoUrl = URL.createObjectURL(blob);
        setCapturedAadhaarPhotoPreview(aadhaarPhotoUrl);
        handleImageUpload(null, blob, false);
        stopCamera();
      }, 'image/png');
    }
  };

  const confirmAadhaarPhoto = () => {
    if (capturedAadhaarPhotoPreview && onComplete) {
      onComplete(formData);
      setCapturedAadhaarPhotoPreview(null);
      setOcrImage(null);
      setAadhaarInputMode(null); // Reset option
    }
  };

  const retakeAadhaarPhoto = () => {
    setCapturedAadhaarPhotoPreview(null);
    setOcrImage(null);
    setOcrLoading(false);
    setShowAadhaarCapture(false);
    setShowAadhaarUploadInput(false);
    setAadhaarInputMode(null);
    setFormData(prev => ({
      ...prev,
      name: "",
      idProofNumber: "",
      dob: "",
      gender: "",
      address: "",
    }));
  };

  const cancelCapture = () => {
    stopCamera();
    setCapturedAadhaarPhotoPreview(null);
    setOcrImage(null);
    setOcrLoading(false);
    setShowAadhaarCapture(false);
    setShowAadhaarUploadInput(false);
    setAadhaarInputMode(null);
    setFormData(prev => ({
      ...prev,
      name: "",
      idProofNumber: "",
      dob: "",
      gender: "",
      address: "",
    }));
  };

  const startTenantPhotoCapture = async () => {
    setTenantPhoto(null);
    setCapturedTenantPhotoPreview(null);
    setShowTenantPhotoUploadInput(false);
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (tenantVideoRef.current) {
        tenantVideoRef.current.srcObject = cameraStream;
      }
      setTenantPhotoStream(cameraStream);
      setShowTenantPhotoCapture(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast("Failed to access camera. Please ensure camera permissions are granted.", { type: "error" });
      setTenantPhotoStream(null);
      setShowTenantPhotoCapture(false);
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
        const photoUrl = URL.createObjectURL(blob);
        setTenantPhoto(photoUrl);
        setCapturedTenantPhotoPreview(photoUrl);
        stopTenantPhotoCapture();
      }, 'image/png');
    }
  };

  const confirmTenantPhoto = () => {
    if (capturedTenantPhotoPreview && onComplete) {
      onComplete(capturedTenantPhotoPreview);
      setCapturedTenantPhotoPreview(null);
    }
  };

  const retakeTenantPhoto = () => {
    setTenantPhoto(null);
    setCapturedTenantPhotoPreview(null);
    setShowTenantPhotoCapture(false);
    setShowTenantPhotoUploadInput(false);
  };

  const cancelTenantPhotoCapture = () => {
    stopTenantPhotoCapture();
    setTenantPhoto(null);
    setCapturedTenantPhotoPreview(null);
    setShowTenantPhotoCapture(false);
    setShowTenantPhotoUploadInput(false);
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
    console.log("OCR Raw Text:", text);
    console.log("Cleaned Text:", cleanText);
    const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
    console.log("Lines:", lines);
    const joinedText = lines.join(" ");
    console.log("Joined Text:", joinedText);

    // Extract Aadhaar number (more robust regex for various formats)
    const aadhaarMatch = joinedText.match(/(\d{4}\s?\d{4}\s?\d{4})|(\d{12})/);
    if (aadhaarMatch) result.idProofNumber = aadhaarMatch[0].replace(/\s/g, "");

    // Extract DOB (DD-MM-YYYY, DD/MM/YYYY, or just year)
    const dobMatch = joinedText.match(/(?:DOB|Date of Birth|जन्म तिथि)[:\s]*(\d{2}[-/.]\d{2}[-/.]\d{4})|\b(19|20)\d{2}\b/i);
    if (dobMatch) {
      result.dob = dobMatch[1] || dobMatch[2];
      if (result.dob && result.dob.length === 4) {
        result.dob = `${result.dob}-01-01`;
      } else if (result.dob) {
        const parts = result.dob.split(/[-/.]/);
        if (parts.length === 3) {
          result.dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }

    // Extract gender
    const genderMatch = joinedText.match(/\b(male|female|पुरुष|महिला)\b/i);
    if (genderMatch) {
      const detectedGender = genderMatch[1].toLowerCase();
      if (detectedGender === 'male' || detectedGender === 'पुरुष') result.gender = "Male";
      else if (detectedGender === 'female' || detectedGender === 'महिला') result.gender = "Female";
    }

    // Extract name (improved logic)
    const nameKeywords = [/Name/i, /नाम/i, /Father/i, /पिता/i, /Husband/i, /पति/i, /Guardian/i, /संरक्षक/i, /Govt/i, /Government/i, /S\/o/i, /D\/o/i, /W\/o/i, /Voter ID/i, /Pan Card/i, /Passport/i, /Driving License/i, /EID/i, /Enrollment ID/i, /To be named as/i, /Care Of/i, /Resident of/i];
    let nameFound = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (nameKeywords.some(keyword => keyword.test(line))) {
            // Look for the name in the next few lines after a keyword
            for (let j = 1; j <= 6 && (i + j) < lines.length; j++) { // Increased look-ahead further
                const potentialName = lines[i + j].trim();
                // Heuristic: Name should not contain numbers, should be reasonably long, and not contain common Aadhaar phrases
                if (potentialName.length > 3 && !/\d/.test(potentialName) && !/DOB|YEAR|GENDER|ADDRESS|भारत सरकार|GOVERNMENT OF INDIA|Aadhaar|UIDAI|VID|Virtual ID|जन्म तिथि|Age|Email|Phone|Mobile|Occupation|Date|Enrollment/i.test(potentialName) && potentialName.split(' ').length <= 6) { // Adjusted max words and added more filter words
                    result.name = potentialName.replace(/[^a-zA-Z\s]/g, '').trim(); // Clean the name
                    if (result.name.length > 0) {
                        nameFound = true;
                        break;
                    }
                }
            }
        }
        if (nameFound) break;
    }
    
    // Fallback for name extraction: look for patterns that look like names on lines not already consumed
    if (!result.name) {
        for (const line of lines) {
            // A more flexible regex for capitalized words, allowing more words and initials
            const nameGuess = line.match(/^[A-Z][a-z]*(?:\s[A-Z][a-z]*){0,5}(?:\s[A-Z]\.?)?$/); // Allow up to 6 words and initials
            if (nameGuess && !/DOB|YEAR|GENDER|ADDRESS|AADHAAR|भारत सरकार|GOVERNMENT OF INDIA|UIDAI|VID|Virtual ID|जन्म तिथि|Age|Email|Phone|Mobile|Occupation|Date|Enrollment/i.test(line) && line.length > 3) {
                result.name = nameGuess[0].replace(/[^a-zA-Z\s]/g, '').trim();
                if (result.name.length > 0) {
                    break;
                }
            }
        }
    }
    // If a name is found, remove it and surrounding keywords from joinedText to prevent interference with address extraction
    if (result.name) {
        const nameRegex = new RegExp(result.name.replace(/[.*+?^${}()|\[\]\\]/g, '\$&'), 'i');
        joinedText.replace(nameRegex, '');
    }

    // Extract address (improved logic)
    const addressKeywords = [/Address/i, /पत्ता/i, /Care of/i, /VPO/i, /Dist/i, /PIN/i, /State/i, /City/i, /ग्राम/i, /गाँव/i, /Taluk/i, /Street/i, /Road/i, /Colony/i, /Nagar/i, /Area/i, /Sector/i, /District/i, /House No/i, /Flat No/i, /Bldg No/i, /Vill/i, /PO/i, /PS/i, /Tehsil/i, /Sub-Dist/i, /SubDistrict/i, /Locality/i, /Landmark/i, /Cross Road/i, /Main Road/i, /Post Office/i, /Police Station/i, /Sub-division/i, /Tehsil/i, /District/i, /State/i, /PIN code/i, /Pin Code/i, /Lane/i, /Plot No/i, /Door No/i, /Mohalla/i, /Gali/i, /Block/i, /Apartment/i, /Floor/i, /Building/i, /Village/i, /Town/i, /City/i, /State/i, /Area Code/i];
    let potentialAddressLines = [];
    let captureAddress = false;
    let pincodeFound = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check for pincode first to mark the end of address block reliably
        if (line.match(/\b\d{6}\b/)) {
            pincodeFound = true;
        }

        if (addressKeywords.some(keyword => keyword.test(line))) {
            captureAddress = true;
            if (!/Address|पत्ता|Care of|PIN code|Pin Code|Area Code/i.test(line)) { // Don't include the keyword itself as part of the address unless it's a part of the address
                potentialAddressLines.push(line);
            }
            continue;
        }
        
        if (captureAddress) {
            // Stop capturing if we hit other personal details, Aadhaar specific phrases, or pincode
            if (line.match(/(\d{4}\s?\d{4}\s?\d{4})|(\d{12})/)|| dobMatch?.test(line) || /Name|Gender|Father|Husband|Occupation|Email|Phone|Mobile|DOB|YEAR|GENDER|Age|Date|Enrollment/i.test(line) || /भारत सरकार|GOVERNMENT OF INDIA|UIDAI|VID|Virtual ID|Voter ID|Pan Card|Passport|Driving License|EID|Enrollment ID/i.test(line) || pincodeFound) {
                captureAddress = false;
            } else if (line.length > 5 && !/^[\d\s]{4,}$/.test(line) && !/Photo|Signature/i.test(line)) { // Avoid capturing long numbers as address lines or photo/signature related text
                potentialAddressLines.push(line.trim());
            }
        }
    }
    
    if (potentialAddressLines.length > 0) {
        result.address = potentialAddressLines.join(", ").replace(/,\s*,/g, ",").trim();
    } else {
        // Fallback: search for a generic address pattern that includes pincode and other common address elements
        const addressPattern = /(\d{1,5}[,\s-]*[A-Za-z\s]+(?:[,\s-]*[A-Za-z\s]+)*(?:Road|Rd|Street|St|Marg|Merg|Colony|Nagar|Area|Sector|District|Dist|City|Village|VPO|PIN|House No|Flat No|Bldg No|Vill|PO|PS|Tehsil|Sub-Dist|SubDistrict|Locality|Landmark|Cross Road|Main Road|Post Office|Police Station|Sub-division|Tehsil|District|State|PIN code|Pin Code|Lane|Plot No|Door No|Mohalla|Gali|Block|Apartment|Floor|Building|Town|City|State|Area Code)\s*[\d-]+(?:\s*[A-Za-z\s]+)*(?:\s*\b\d{6}\b)?)/i; // Added more keywords and optional pincode at the end
        const addressMatch = joinedText.match(addressPattern);
        if (addressMatch) result.address = addressMatch[1];
    }

    // Post-processing for address to clean up common OCR errors or extraneous text
    result.address = result.address.replace(/\s*([.,-])\s*/g, '$1').replace(/\s{2,}/g, ' ').trim();
    result.address = result.address.replace(/(?:DOB|Date of Birth|जन्म तिथि)[:\s]*\S+/i, '').trim();
    result.address = result.address.replace(/(?:male|female|पुरुष|महिला)/i, '').trim();
    result.address = result.address.replace(/Aadhaar|UIDAI|VID|Virtual ID|Voter ID|Pan Card|Passport|Driving License|EID|Enrollment ID/i, '').trim();
    result.address = result.address.replace(/Government of India|भारत सरकार/i, '').trim();
    result.address = result.address.replace(/Email|Phone|Mobile|Occupation|Date|Enrollment|Photo|Signature/i, '').trim(); // Removed more keywords
    result.address = result.address.replace(/[^a-zA-Z0-9\s,\-.\/]/g, '').trim(); // Remove any remaining special characters except basic punctuation
    result.address = result.address.replace(/(^[,.\-\/\s]*)|([,.\-\/\s]*$)/g, '').trim(); // Remove leading/trailing punctuation

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

  // Render different form sections based on formMode
  const renderFormContent = () => {
    switch (formMode) {
      case "tenantPhotoCapture":
        return (
          <div className="premium-tenant-step">
            {!capturedTenantPhotoPreview ? (
              <div className="flex flex-col items-center">
                <video ref={tenantVideoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-md mb-4"></video>
                <div className="flex gap-4">
                  <button type="button" onClick={captureTenantPhoto} className="premium-tenant-submit-btn">
                    <FaCamera className="mr-2" /> Capture Photo
                  </button>
                  <button type="button" onClick={cancelTenantPhotoCapture} className="premium-tenant-back-btn">
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold mb-4">Photo Preview</h3>
                <img src={capturedTenantPhotoPreview} alt="Captured Tenant" className="w-full max-w-sm rounded-lg shadow-md mb-4" />
                <div className="flex gap-4">
                  <button type="button" onClick={retakeTenantPhoto} className="premium-tenant-back-btn">
                    <FaRedo className="mr-2" /> Retake
                  </button>
                  <button type="button" onClick={confirmTenantPhoto} className="premium-tenant-submit-btn">
                    <FaCheckCircle className="mr-2" /> Confirm Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "tenantPhotoUpload":
        return (
          <div className="premium-tenant-step">
            {!capturedTenantPhotoPreview ? (
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, null, true)}
                  className="mb-4 p-2 border rounded-md"
                />
                <button type="button" onClick={cancelTenantPhotoCapture} className="premium-tenant-back-btn">
                    <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold mb-4">Photo Preview</h3>
                <img src={capturedTenantPhotoPreview} alt="Uploaded Tenant" className="w-full max-w-sm rounded-lg shadow-md mb-4" />
                <div className="flex gap-4">
                  <button type="button" onClick={retakeTenantPhoto} className="premium-tenant-back-btn">
                    <FaRedo className="mr-2" /> Retake
                  </button>
                  <button type="button" onClick={confirmTenantPhoto} className="premium-tenant-submit-btn">
                    <FaCheckCircle className="mr-2" /> Confirm Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "aadhaarUpload":
        return (
          <div className="premium-tenant-step">
            {!capturedAadhaarPhotoPreview ? (
              // Show initial choice or selected input method
              aadhaarInputMode === null ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">Aadhaar Card</h3>
                  <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                    <button
                      type="button"
                      onClick={() => setAadhaarInputMode('upload')}
                      className="premium-tenant-submit-btn flex-1 flex items-center justify-center py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg"
                    >
                      <FaUpload className="mr-3 text-xl" /> Upload Aadhaar Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAadhaarInputMode('camera');
                        startCamera();
                      }}
                      className="premium-tenant-back-btn flex-1 flex items-center justify-center py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg"
                    >
                      <FaCamera className="mr-3 text-xl" /> Capture Live Aadhaar Photo
                    </button>
                  </div>
                </div>
              ) : aadhaarInputMode === 'camera' ? (
                // Camera view
                <div className="flex flex-col items-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-md mb-4"></video>
                  <div className="flex gap-4">
                    <button type="button" onClick={capturePhoto} className="premium-tenant-submit-btn">
                      <FaCamera className="mr-2" /> Capture Aadhaar
                    </button>
                    <button type="button" onClick={cancelCapture} className="premium-tenant-back-btn">
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Upload file view
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, null, false)}
                    className="mb-4 p-2 border rounded-md"
                  />
                  <button type="button" onClick={cancelCapture} className="premium-tenant-back-btn">
                      <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              )
            ) : (
              // Aadhaar Photo Preview and OCR data display
              <div className="premium-tenant-form-container">
                  <div className="premium-tenant-ocr-preview mt-4">
                      <img src={capturedAadhaarPhotoPreview} alt="Aadhaar Preview" />
                      <p className="premium-tenant-ocr-note">
                          Review extracted details below and edit if needed
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedAadhaarPhotoPreview(null);
                          setOcrImage(null);
                          setOcrLoading(false);
                          setAadhaarInputMode(null); // Go back to choice screen
                          setFormData(prev => ({
                            ...prev,
                            name: "",
                            idProofNumber: "",
                            dob: "",
                            gender: "",
                            address: "",
                          }));
                        }}
                        className="premium-tenant-btn premium-tenant-retake-btn mt-2"
                      >
                        <FaRedo className="mr-2" /> Choose New Photo
                      </button>
                  </div>

                  {ocrLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <p className="text-gray-600">Processing Aadhaar details...</p>
                    </div>
                  ) : (
                    <div className="premium-tenant-form-grid mt-4">
                        <div className="premium-tenant-form-group">
                            <label htmlFor="name" className="premium-tenant-form-label">
                                <FaUser className="inline-block mr-2" /> Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={onChange}
                                className="premium-tenant-form-input"
                                placeholder="Extracted Name"
                                required
                            />
                        </div>
                        <div className="premium-tenant-form-group">
                            <label htmlFor="idProofNumber" className="premium-tenant-form-label">
                                <FaIdCard className="inline-block mr-2" /> Aadhaar Number
                            </label>
                            <input
                                type="text"
                                id="idProofNumber"
                                name="idProofNumber"
                                value={formData.idProofNumber}
                                onChange={onChange}
                                className="premium-tenant-form-input"
                                placeholder="Extracted Aadhaar Number"
                                required
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
                                placeholder="Extracted DOB"
                                required
                            />
                        </div>
                        <div className="premium-tenant-form-group">
                            <label htmlFor="gender" className="premium-tenant-form-label">
                                <FaUserFriends className="inline-block mr-2" /> Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={onChange}
                                className="premium-tenant-form-select"
                                required
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
                                value={formData.address}
                                onChange={onChange}
                                rows="3"
                                className="premium-tenant-form-input"
                                placeholder="Extracted Address"
                                required
                            ></textarea>
                        </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        );

      case "additionalDetails":
        return (
          <div className="premium-tenant-form-grid">
            <div className="premium-tenant-form-group">
              <label htmlFor="email" className="premium-tenant-form-label">
                <FaEnvelope className="inline-block mr-2" /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                className="premium-tenant-form-input"
                placeholder="Enter email address (optional)"
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
                value={formData.occupation}
                onChange={onChange}
                className="premium-tenant-form-input"
                placeholder="Enter occupation (optional)"
              />
            </div>

            <div className="premium-tenant-form-group">
              <label htmlFor="roomId" className="premium-tenant-form-label">
                <FaBuilding className="inline-block mr-2" /> Room
              </label>
              <select
                id="roomId"
                name="roomId"
                value={formData.roomId}
                onChange={onChange}
                className="premium-tenant-form-select"
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option
                    key={room._id}
                    value={room._id}
                    disabled={room.occupiedBeds >= room.capacity}
                  >
                    Floor {room.floorNumber}, Room {room.roomNumber}
                    {room.occupiedBeds > 0
                      ? ` (${room.occupiedBeds}/${room.capacity} occupied)`
                      : " (Vacant)"}
                  </option>
                ))}
              </select>
          </div>

            {formData.roomId && (
              <div className="premium-tenant-form-group">
                <label htmlFor="bedName" className="premium-tenant-form-label">
                  <FaBed className="inline-block mr-2" /> Bed Name
                </label>
                <select
                  id="bedName"
                  name="bedName"
                  value={formData.bedName}
                  onChange={onChange}
                  className="premium-tenant-form-select"
                  required
                >
                  <option value="">Select Bed</option>
                  {formData.roomId && rooms.find(r => r._id === formData.roomId)?.bedNames && rooms.find(r => r._id === formData.roomId).bedNames.map(bedNameOption => (
                    <option key={bedNameOption} value={bedNameOption}>
                      {bedNameOption}
                        </option>
                  ))}
                </select>
        </div>
      )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="premium-tenant-form">
            {renderFormContent()}
    </div>
  );
};

export default TenantForm; 