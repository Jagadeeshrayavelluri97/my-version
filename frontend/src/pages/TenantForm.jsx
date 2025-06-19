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
  const preselectedBedNumber = queryParams.get("bedNumber");
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
  const [showTenantPhotoCapture, setShowTenantPhotoCapture] = useState(formMode === "tenantPhotoCapture");
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
    }).catch(err => {
      console.error("OCR Error:", err);
      showToast("Failed to process Aadhaar image", { type: "error" });
      setOcrLoading(false);
    });
  };

  const startCamera = async () => {
    setCapturedImage(null);
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
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
          <div className="premium-tenant-form-section">
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
        );

      case "aadhaarUpload":
        return (
          <div className="premium-tenant-form-section">
            {/* Show upload/capture options if no OCR image is present and not loading */}
            {!ocrImage && !ocrLoading && (
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
            )}

            {/* Show live capture view */}
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

            {/* Show captured image preview for Aadhaar */}
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

            {/* Show OCR loading spinner */}
            {ocrLoading && (
              <div className="premium-tenant-ocr-loading mt-4">
                  <div className="premium-tenant-ocr-spinner"></div>
                  <span>Processing Aadhaar Card...</span>
                </div>
              )}

            {/* Show OCR preview and editable form fields only after OCR is done and image is present */}
            {ocrImage && !ocrLoading && (
              <div className="premium-tenant-form-container">
                  <div className="premium-tenant-ocr-preview mt-4">
                      <img src={ocrImage} alt="Aadhaar Preview" />
                      <p className="premium-tenant-ocr-note">
                          Review extracted details below and edit if needed
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOcrImage(null);
                          setCapturedImage(null);
                          setShowLiveCapture(false);
                          setFormData(prev => ({ // Optionally clear Aadhaar related form data
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
                        <FaRedo className="mr-2" /> Upload Again
                      </button>
                  </div>

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
                <label htmlFor="bedNumber" className="premium-tenant-form-label">
                  <FaBed className="inline-block mr-2" /> Bed Number
                </label>
                <select
                  id="bedNumber"
                  name="bedNumber"
                  value={formData.bedNumber.toString()}
                  onChange={onChange}
                  className="premium-tenant-form-select"
                  required
                >
                  <option value="">Select a bed</option>
                  {formData.roomId && rooms.find(r => r._id === formData.roomId) &&
                    Array.from({ length: rooms.find(r => r._id === formData.roomId).capacity }, (_, i) => {
                      const selectedRoom = rooms.find(r => r._id === formData.roomId);
                      const roomTenants = getTenantsByRoom(formData.roomId);
                      const isBedOccupied = roomTenants.some(
                        tenant => tenant.bedNumber === (i+1)
                      );

                      return (
                        <option
                          key={i+1}
                          value={(i+1).toString()}
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
              <label htmlFor="joiningDate" className="premium-tenant-form-label">
                <FaCalendarAlt className="inline-block mr-2" /> Joining Date
              </label>
              <input
                type="date"
                id="joiningDate"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={onChange}
                className="premium-tenant-form-input"
                required
              />
            </div>
          </div>
        );

      default:
        return (
            <div className="premium-tenant-form-grid">
            {/* Original form fields */}
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
                value={formData.email}
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
                value={formData.phone}
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
                value={formData.occupation}
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
                value={formData.idProofType}
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
                value={formData.idProofNumber}
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
                value={formData.gender}
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
                value={formData.address}
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
                  <label htmlFor="bedNumber" className="premium-tenant-form-label">
                    <FaBed className="inline-block mr-2" /> Bed Number
                  </label>
                  <select
                    id="bedNumber"
                    name="bedNumber"
                  value={formData.bedNumber.toString()}
                    onChange={onChange}
                  className="premium-tenant-form-select"
                    required
                  >
                    <option value="">Select a bed</option>
                  {formData.roomId && rooms.find(r => r._id === formData.roomId) &&
                    Array.from({ length: rooms.find(r => r._id === formData.roomId).capacity }, (_, i) => {
                      const selectedRoom = rooms.find(r => r._id === formData.roomId);
                      const roomTenants = getTenantsByRoom(formData.roomId);
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
                          {isEditMode && (i+1) === formData.bedNumber ? ' (Current)' : ''}
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
                value={formData.joiningDate}
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
                  value={formData.active.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.value === "true",
                      })
                    }
                    className="premium-tenant-form-select"
                    style={{
                    borderColor: formData.active ? "#10b981" : "#ef4444",
                    backgroundColor: formData.active
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
        );
    }
  };

  return (
    <div className="premium-tenant-container">
      {!showOnlyAadhaar && formMode === "full" && (
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

      <div className="premium-tenant-form-card">
        <div className="premium-tenant-form-body">
          <form onSubmit={onSubmit} ref={formRef}>
            {renderFormContent()}

            <div className="premium-tenant-form-footer">
              <button
                type="submit"
                disabled={loading || (formMode === "tenantPhotoCapture" && !tenantPhoto)}
                className="premium-tenant-submit-btn"
              >
                <FaSave className="mr-2" />
                {loading
                  ? "Saving..."
                  : formMode === "tenantPhotoCapture"
                  ? "Continue with Photo"
                  : formMode === "aadhaarUpload"
                  ? "Continue with Aadhaar"
                  : formMode === "additionalDetails"
                  ? "Continue with Details"
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