import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaArrowRight, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { showToast } from '../utils/toast';
import TenantForm from './TenantForm';

const TenantOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [tenantPhoto, setTenantPhoto] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [fullFormData, setFullFormData] = useState(null);

  const steps = [
    { id: 1, title: 'Mobile Number Verification' },
    { id: 2, title: 'Live Photo Capture' },
    { id: 3, title: 'Aadhaar Card Upload' },
    { id: 4, title: 'Additional Details' },
    { id: 5, title: 'Review & Submit' }
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
    navigate('/rooms');
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
              onTenantPhotoCaptured={handleTenantPhotoCaptured} 
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
            />
          </div>
        );

      case 4:
        return (
          <div className="premium-tenant-step">
            <h2 className="text-2xl font-bold mb-6">Additional Details</h2>
            <TenantForm
              formMode="additionalDetails"
              initialData={aadhaarData}
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
                <div className="premium-tenant-review-item">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Aadhaar Details Verified</span>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {aadhaarData.name}</p>
                    <p><strong>Aadhaar No:</strong> {aadhaarData.idProofNumber}</p>
                    <p><strong>DOB:</strong> {aadhaarData.dob}</p>
                    <p><strong>Gender:</strong> {aadhaarData.gender}</p>
                    <p><strong>Address:</strong> {aadhaarData.address}</p>
                  </div>
                </div>
              )}
              {fullFormData && (
                <div className="premium-tenant-review-item">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Additional Details</span>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Email:</strong> {fullFormData.email}</p>
                    <p><strong>Occupation:</strong> {fullFormData.occupation}</p>
                    <p><strong>Room:</strong> {fullFormData.roomId}</p>
                    <p><strong>Bed:</strong> {fullFormData.bedNumber}</p>
                    <p><strong>Joining Date:</strong> {fullFormData.joiningDate}</p>
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
            <div className="premium-tenant-step-number">{step.id}</div>
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