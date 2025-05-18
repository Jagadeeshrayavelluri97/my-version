import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { showToast } from "../utils/toast";
import {
  FaCheck,
  FaClock,
  FaFilter,
  FaMoneyBillWave,
  FaPlus,
  FaSync,
  FaExclamationTriangle,
  FaSearch,
} from "react-icons/fa";
import RentCard from "../components/RentCard";

const RentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [processingRent, setProcessingRent] = useState(false);
  const [overdueRents, setOverdueRents] = useState([]);
  const [allRents, setAllRents] = useState([]);
  const [activeTab, setActiveTab] = useState("overdue");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    paymentMethod: "Cash",
    paymentReference: "",
    notes: "",
  });

  const location = useLocation();

  // Fetch overdue rents
  const fetchOverdueRents = async () => {
    try {
      const res = await axios.get("/rents/overdue");
      if (res.data.success) {
        setOverdueRents(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching overdue rents:", err);
      showToast("Failed to fetch overdue rents", location);
    }
  };

  // Fetch all rents
  const fetchAllRents = async () => {
    try {
      const res = await axios.get("/rents");
      if (res.data.success) {
        setAllRents(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching all rents:", err);
      showToast("Failed to fetch all rents", location);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOverdueRents(), fetchAllRents()]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate monthly rents for all tenants
  const generateMonthlyRents = async () => {
    setProcessingRent(true);
    try {
      const res = await axios.post("/rents/generate-monthly");
      if (res.data.success) {
        showToast(
          `Generated ${res.data.data.created} rent records for ${res.data.data.month}/${res.data.data.year}`,
          location
        );
        fetchAllData();
      } else {
        showToast("Failed to generate monthly rents", location);
      }
    } catch (err) {
      console.error("Error generating monthly rents:", err);
      showToast(
        err.response?.data?.error || "Failed to generate monthly rents",
        location
      );
    } finally {
      setProcessingRent(false);
    }
  };

  // Create rent records for tenants
  const createRentRecords = async (rents) => {
    setProcessingRent(true);
    try {
      const res = await axios.post("/rents/create-auto", {
        rentData: rents,
      });

      if (res.data.success) {
        showToast(`Created ${res.data.count} rent records successfully`, location);
        fetchAllData(); // Refresh data after creating rent records
      } else {
        showToast("Failed to create rent records", location);
      }
    } catch (err) {
      console.error("Error creating rent records:", err);
      showToast(err.response?.data?.error || "Failed to create rent records", location);
    } finally {
      setProcessingRent(false);
    }
  };

  // Mark rent as paid
  const markRentAsPaid = async (rentId, amount = null) => {
    setProcessingRent(true);
    try {
      const paymentData = {
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.paymentReference,
        notes: paymentDetails.notes,
      };

      if (amount) {
        paymentData.amount = amount;
      }

      const res = await axios.put(`/rents/${rentId}/pay`, paymentData);

      if (res.data.success) {
        showToast("Rent marked as paid successfully", location);
        if (res.data.nextRent) {
          showToast("Next month's rent record created automatically", location);
        }
        setShowPaymentModal(false);
        setSelectedRent(null);
        fetchAllData();
      } else {
        showToast("Failed to mark rent as paid", location);
      }
    } catch (err) {
      console.error("Error marking rent as paid:", err);
      showToast(err.response?.data?.error || "Failed to mark rent as paid", location);
    } finally {
      setProcessingRent(false);
    }
  };

  // Handle payment modal open
  const openPaymentModal = (rent) => {
    setSelectedRent(rent);
    setPaymentDetails({
      amount: rent.amount - (rent.amountPaid || 0),
      paymentMethod: "Cash",
      paymentReference: "",
      notes: "",
    });
    setShowPaymentModal(true);
  };

  // Filter rents based on status and search term
  const getFilteredRents = () => {
    let filteredRents = [];

    // First, filter by tab
    if (activeTab === "overdue") {
      filteredRents = overdueRents;
    } else if (activeTab === "records") {
      // Show all rent records sorted by date (most recent first)
      filteredRents = [...allRents].sort(
        (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
      );
    } else {
      // Filter all rents based on selected filter
      if (filter === "all") {
        filteredRents = allRents;
      } else if (filter === "paid") {
        filteredRents = allRents.filter((rent) => rent.isPaid);
      } else if (filter === "pending") {
        filteredRents = allRents.filter(
          (rent) => !rent.isPaid && rent.status === "Pending"
        );
      } else if (filter === "partial") {
        filteredRents = allRents.filter(
          (rent) => !rent.isPaid && rent.status === "Partially Paid"
        );
      } else if (filter === "overdue") {
        filteredRents = allRents.filter(
          (rent) => !rent.isPaid && rent.status === "Overdue"
        );
      } else {
        filteredRents = allRents;
      }
    }

    // Then, filter by search term if provided
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filteredRents = filteredRents.filter((rent) => {
        // Search by tenant name
        const tenantName =
          rent.tenantDeleted && rent.tenantInfo
            ? rent.tenantInfo.name
            : rent.tenantId
            ? rent.tenantId.name
            : "";

        // Search by room number
        const roomDetails =
          rent.tenantDeleted && rent.roomInfo
            ? `Floor ${rent.roomInfo.floorNumber}, Room ${rent.roomInfo.roomNumber}`
            : rent.roomId
            ? `Floor ${rent.roomId.floorNumber}, Room ${rent.roomId.roomNumber}`
            : "";

        // Search by month/year
        const monthYear = `${getMonthName(rent.month)} ${rent.year}`;

        return (
          tenantName.toLowerCase().includes(term) ||
          roomDetails.toLowerCase().includes(term) ||
          monthYear.toLowerCase().includes(term)
        );
      });
    }

    return filteredRents;
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading rent data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Rent Management</h1>
        <p className="text-blue-100">
          Track and manage tenant rent payments efficiently
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by tenant, room, or month..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={fetchAllData}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to="/rents/add"
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New Rent
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="rent-filter-container mb-6">
        <button
          onClick={() => setActiveTab("overdue")}
          className={`rent-filter-btn ${
            activeTab === "overdue" ? "active" : ""
          }`}
        >
          <FaClock className="rent-filter-btn-icon" />
          Overdue
          {overdueRents.length > 0 && (
            <span className="rent-filter-badge">{overdueRents.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`rent-filter-btn ${
            activeTab === "records" ? "active" : ""
          }`}
        >
          <FaMoneyBillWave className="rent-filter-btn-icon" />
          Rent Records
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`rent-filter-btn ${activeTab === "all" ? "active" : ""}`}
        >
          <FaFilter className="rent-filter-btn-icon" />
          All Rents
        </button>
      </div>

      {activeTab === "all" && (
        <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Rents
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === "paid"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === "pending"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("partial")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === "partial"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Partially Paid
            </button>
            <button
              onClick={() => setFilter("overdue")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === "overdue"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overdue
            </button>
          </div>
        </div>
      )}

      {activeTab === "records" && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Rent Records
          </h2>
          <p className="text-sm text-gray-600">
            View all rent records sorted by due date (most recent first). Use
            this section to track all rent payments.
          </p>
        </div>
      )}

      {/* Rent Cards Grid */}
      <div className="rent-cards-container">
        {getFilteredRents().length > 0 ? (
          getFilteredRents().map((rent) => (
            <RentCard
              key={
                rent._id || `${rent.tenantId?._id}-${rent.month}-${rent.year}`
              }
              rent={rent}
              onPayClick={openPaymentModal}
              processingRent={processingRent}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">
              {activeTab === "overdue"
                ? "No overdue rents."
                : activeTab === "records"
                ? "No rent records found."
                : searchTerm
                ? "No rents match your search criteria."
                : "No rent records found."}
            </p>
          </div>
        )}
      </div>

      {/* Bulk Create Rent Records Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Bulk Create Rent Records
        </h2>
        <p className="text-gray-600 mb-4">
          Use this section to create rent records for all active tenants for a
          specific month and year. This is useful for generating rent records in
          advance.
        </p>

        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={generateMonthlyRents}
            disabled={processingRent}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-6 rounded-lg transition-colors shadow-sm flex items-center"
          >
            {processingRent ? (
              <>
                <FaSync className="inline-block mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaPlus className="inline-block mr-2" />
                Generate Next Month's Rent Records
              </>
            )}
          </button>

          <Link
            to="/rents/add"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-6 rounded-lg transition-colors shadow-sm flex items-center"
          >
            <FaPlus className="inline-block mr-2" />
            Create Individual Rent Record
          </Link>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                Tenant:{" "}
                {selectedRent.tenantDeleted && selectedRent.tenantInfo
                  ? `${selectedRent.tenantInfo.name} (Deleted)`
                  : selectedRent.tenantId
                  ? selectedRent.tenantId.name
                  : "Unknown"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Period: {getMonthName(selectedRent.month)} {selectedRent.year}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Due Date: {new Date(selectedRent.dueDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Total Amount: ₹{selectedRent.amount}
              </p>
              {selectedRent.amountPaid > 0 && (
                <div className="bg-blue-50 p-2 rounded mb-3">
                  <p className="text-sm text-blue-800">
                    Already Paid: ₹{selectedRent.amountPaid}
                  </p>
                  <p className="text-sm text-blue-800">
                    Remaining: ₹{selectedRent.amount - selectedRent.amountPaid}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentDetails.amount}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    amount: parseFloat(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                max={selectedRent.amount - (selectedRent.amountPaid || 0)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentDetails.paymentMethod}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    paymentMethod: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentDetails.paymentReference}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    paymentReference: e.target.value,
                  })
                }
                placeholder="Transaction ID, Cheque No., etc."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={paymentDetails.notes}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    notes: e.target.value,
                  })
                }
                placeholder="Any additional notes"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  markRentAsPaid(selectedRent._id, paymentDetails.amount)
                }
                disabled={processingRent}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-colors"
              >
                {processingRent ? "Processing..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default RentManagement;
