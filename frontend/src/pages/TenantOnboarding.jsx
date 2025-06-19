import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCamera, FaArrowRight, FaArrowLeft, FaCheckCircle, FaMobile, FaIdCard, FaUser } from 'react-icons/fa';
import { showToast } from '../utils/toast';
import TenantForm from './TenantForm';

const TenantOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [tenantPhoto, setTenantPhoto] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [fullFormData, setFullFormData] = useState(null);

  // Get parameters from URL query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const preselectedRoomId = queryParams.get("roomId");
  const preselectedBedNumber = queryParams.get("bedNumber");
  const returnToRoom = queryParams.get("returnToRoom") === "true";

  const steps = [
    { id: 1, title: 'Mobile Number Verification', icon: FaMobile },
    { id: 2, title: 'Live Photo Capture', icon: FaCamera },
    { id: 3, title: 'Aadhaar Card Upload', icon: FaIdCard },
    { id: 4, title: 'Additional Details', icon: FaUser },
    { id: 5, title: 'Review & Submit', icon: FaCheckCircle }
  ];

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (mobileNumber.length === 10) {
      setCurrentStep(2);
    } else {
      showToast('Please enter a valid 10-digit mobile number', { type: 'error' });
    }
  };

  const handleTenantPhotoCaptured = (photoUrl) => {
    setTenantPhoto(photoUrl);
    setCurrentStep(3);
  };

  const handleAadhaarData = (data) => {
    setAadhaarData(data);
    setFullFormData(prev => ({ ...prev, ...data }));
  };

  const handleAadhaarReviewComplete = (aadhaarFormData) => {
    setAadhaarData(aadhaarFormData);
    setFullFormData(prev => ({ ...prev, ...aadhaarFormData }));
    setCurrentStep(4);
  };

  const handleAdditionalDetailsComplete = (data) => {
    setFullFormData(prev => ({ 
      ...prev, 
      ...data,
      mobileNumber: mobileNumber,
      tenantPhoto: tenantPhoto,
    }));
    setCurrentStep(5);
  };

  const handleSubmitFinal = () => {
    console.log("Final Tenant Data:", fullFormData);
    showToast("Tenant onboarding complete!", { type: "success" });
    if (returnToRoom && preselectedRoomId) {
      navigate(`/rooms/details/${preselectedRoomId}`);
    } else {
      navigate('/tenants');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="premium-tenant-step">
            <h2 className="text-2xl font-bold mb-6">Enter Mobile Number</h2>
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="premium-tenant-form-group">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="premium-tenant-form-input"
                  maxLength="10"
                  required
                />
              </div>
              <button type="submit" className="premium-tenant-submit-btn">
                Continue <FaArrowRight className="ml-2" />
              </button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="premium-tenant-step">
            <h2 className="text-2xl font-bold mb-6">Capture Live Photo</h2>
            <TenantForm 
              formMode="tenantPhotoCapture" 
              onComplete={handleTenantPhotoCaptured} 
            />
          </div>
        );

      case 3:
        return (
          <div className="premium-tenant-step">
            <h2 className="text-2xl font-bold mb-6">Upload Aadhaar Card</h2>
            <TenantForm
              formMode="aadhaarUpload"
              onAadhaarData={handleAadhaarData}
              onComplete={handleAadhaarReviewComplete}
            />
          </div>
        );

      case 4:
        return (
          <div className="premium-tenant-step">
            <h2 className="text-2xl font-bold mb-6">Additional Details</h2>
            <TenantForm
              formMode="additionalDetails"
              initialData={fullFormData}
              onComplete={handleAdditionalDetailsComplete}
            />
          </div>
        );

      case 5:
        return (
          <div className="premium-tenant-step">
            <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>
            <div className="space-y-6">
              <div className="premium-tenant-review-item">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span>Mobile Number: {mobileNumber}</span>
              </div>
              {tenantPhoto && (
                <div className="premium-tenant-review-item">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Tenant Photo Captured</span>
                  <img
                    src={tenantPhoto}
                    alt="Tenant Captured"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              {aadhaarData && (
                <div className="premium-tenant-review-item flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <div className="flex flex-col">
                    <span>Aadhaar Details Verified</span>
                    <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className="font-bold text-right">Name:</p><p>{aadhaarData.name || 'N/A'}</p>
                      <p className="font-bold text-right">Aadhaar No:</p><p>{aadhaarData.idProofNumber || 'N/A'}</p>
                      <p className="font-bold text-right">DOB:</p><p>{aadhaarData.dob || 'N/A'}</p>
                      <p className="font-bold text-right">Gender:</p><p>{aadhaarData.gender || 'N/A'}</p>
                      <p className="font-bold text-right">Address:</p><p>{aadhaarData.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
              {fullFormData && (
                <div className="premium-tenant-review-item">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Additional Details</span>
                  <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                    <p className="font-bold text-right">Email:</p><p>{fullFormData.email || 'N/A'}</p>
                    <p className="font-bold text-right">Occupation:</p><p>{fullFormData.occupation || 'N/A'}</p>
                    <p className="font-bold text-right">Room:</p><p>{fullFormData.roomId || 'N/A'}</p>
                    <p className="font-bold text-right">Bed:</p><p>{fullFormData.bedNumber || 'N/A'}</p>
                    <p className="font-bold text-right">Joining Date:</p><p>{fullFormData.joiningDate || 'N/A'}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleSubmitFinal}
                className="premium-tenant-submit-btn"
              >
                Complete Onboarding
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="premium-tenant-onboarding">
      <div className="premium-tenant-steps">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`premium-tenant-step-indicator ${
              currentStep >= step.id ? 'active' : ''
            }`}
          >
            <div className="premium-tenant-step-number">
              <step.icon className="text-xl" />
            </div>
            <div className="premium-tenant-step-title">{step.title}</div>
          </div>
        ))}
      </div>

      <div className="premium-tenant-content">
        {renderStep()}
      </div>

      {currentStep > 1 && currentStep < 5 && (
        <button
          onClick={() => {
            setCurrentStep(currentStep - 1);
          }}
          className="premium-tenant-back-btn"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      )}
    </div>
  );
};

export default TenantOnboarding; 