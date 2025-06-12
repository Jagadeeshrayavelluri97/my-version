import React from "react";
import { Link } from "react-router-dom";
import { 
  FaCheck, 
  FaCalendarAlt, 
  FaBuilding, 
  FaUser, 
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle
} from "react-icons/fa";

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
};

const RentCard = ({ rent, onPayClick, processingRent }) => {
  const { 
    _id, 
    tenantId, 
    roomId, 
    month, 
    year, 
    dueDate, 
    amount, 
    amountPaid, 
    isPaid, 
    status,
    tenantDeleted,
    tenantInfo,
    roomInfo,
    daysOverdue,
    paymentPeriod,
    weekNumber
  } = rent;

  // Get tenant name
  const getTenantName = () => {
    if (tenantDeleted && tenantInfo) {
      return `${tenantInfo.name} (Deleted)`;
    } else if (tenantId) {
      return tenantId.name;
    }
    return "Unknown Tenant";
  };

  // Get tenant phone
  const getTenantPhone = () => {
    if (tenantDeleted && tenantInfo && tenantInfo.phone) {
      return tenantInfo.phone;
    } else if (!tenantDeleted && tenantId && tenantId.phone) {
      return tenantId.phone;
    }
    return "";
  };

  // Get room details
  const getRoomDetails = () => {
    if (tenantDeleted && roomInfo) {
      return `Floor ${roomInfo.floorNumber}, Room ${roomInfo.roomNumber}`;
    } else if (roomId) {
      return `Floor ${roomId.floorNumber}, Room ${roomId.roomNumber}`;
    }
    return "Unknown Room";
  };

  // Get status class
  const getStatusClass = () => {
    if (isPaid) return "rent-status-paid";
    if (status === "Overdue") return "rent-status-overdue";
    if (status === "Partially Paid") return "rent-status-partial";
    return "rent-status-pending";
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rent-card">
      <div className="rent-card-header">
        <h3 className="rent-card-title">{getTenantName()}</h3>
        <div className="rent-card-subtitle">
          {paymentPeriod === "monthly" && (
            <span>{getMonthName(month)} {year}</span>
          )}
          {paymentPeriod === "weekly" && weekNumber && (
            <span>Week {weekNumber}, {year}</span>
          )}
          {paymentPeriod === "daily" && (
            <span>{formatDate(dueDate)}</span>
          )}
          {daysOverdue > 0 && !isPaid && (
            <span className="text-red-600 font-medium">{daysOverdue} days overdue</span>
          )}
        </div>
      </div>
      
      <div className="rent-card-body">
        <div className="rent-card-info">
          <div className="rent-card-info-item">
            <div className="rent-card-info-icon">
              <FaUser />
            </div>
            <div className="rent-card-info-label">Tenant:</div>
            <div className="rent-card-info-value">
              {getTenantName()}
              {getTenantPhone() && (
                <div className="text-xs text-gray-500 mt-1">{getTenantPhone()}</div>
              )}
            </div>
          </div>
          
          <div className="rent-card-info-item">
            <div className="rent-card-info-icon">
              <FaBuilding />
            </div>
            <div className="rent-card-info-label">Room:</div>
            <div className="rent-card-info-value">{getRoomDetails()}</div>
          </div>
          
          <div className="rent-card-info-item">
            <div className="rent-card-info-icon">
              <FaCalendarAlt />
            </div>
            <div className="rent-card-info-label">Due Date:</div>
            <div className="rent-card-info-value">{formatDate(dueDate)}</div>
          </div>
        </div>
        
        <div className="rent-card-amount">
          <div className="rent-card-amount-label">Amount:</div>
          <div className="rent-card-amount-value">₹{amount}</div>
        </div>
        
        {amountPaid > 0 && amountPaid < amount && (
          <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Paid:</span>
              <span className="font-medium">₹{amountPaid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Due:</span>
              <span className="font-medium">₹{amount - amountPaid}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="rent-card-status">
        <div className={`rent-status-badge ${getStatusClass()}`}>
          {isPaid ? (
            <>
              <FaCheck className="mr-1" /> Paid
            </>
          ) : status === "Overdue" ? (
            <>
              <FaExclamationTriangle className="mr-1" /> Overdue
            </>
          ) : status === "Partially Paid" ? (
            <>
              <FaMoneyBillWave className="mr-1" /> Partially Paid
            </>
          ) : (
            <>
              <FaClock className="mr-1" /> Pending
            </>
          )}
        </div>
      </div>
      
      <div className="rent-card-actions">
        {!isPaid && (
          <button 
            className="rent-card-btn rent-card-btn-pay"
            onClick={() => onPayClick(rent)}
            disabled={processingRent}
          >
            <FaCheck className="rent-card-btn-icon" /> Pay
          </button>
        )}
        <Link 
          to={`/rents/edit/${_id}`} 
          className="rent-card-btn rent-card-btn-details"
        >
          <FaMoneyBillWave className="rent-card-btn-icon" /> Details
        </Link>
      </div>
    </div>
  );
};

export default RentCard;
