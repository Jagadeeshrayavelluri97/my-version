import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { showToast } from "../utils/toast";

const RentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    tenantId: "",
    amount: "",
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(),
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5)
      .toISOString()
      .split("T")[0], // 5th of current month
    isPaid: false,
    paymentDate: "",
    paymentMethod: "",
    paymentReference: "",
  });

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);

  const {
    tenantId,
    amount,
    month,
    year,
    dueDate,
    isPaid,
    paymentDate,
    paymentMethod,
    paymentReference,
  } = formData;

  const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"];

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axios.get("/tenants");
        if (res.data.success) {
          setTenants(res.data.data);
        } else {
          setTenants([]);
          showToast("Failed to fetch tenants", location);
        }
      } catch (err) {
        console.error("Error fetching tenants:", err);
        showToast("Failed to fetch tenants", location);
        setTenants([]);
      }
    };

    const fetchRent = async () => {
      if (isEditMode) {
        try {
          const res = await axios.get(`/rents/${id}`);
          if (res.data.success) {
            const rent = res.data.data;
            // Format dates for the date inputs
            if (rent.dueDate) {
              rent.dueDate = new Date(rent.dueDate).toISOString().split("T")[0];
            }
            if (rent.paymentDate) {
              rent.paymentDate = new Date(rent.paymentDate)
                .toISOString()
                .split("T")[0];
            }
            setFormData(rent);
          } else {
            showToast("Failed to fetch rent details", location);
          }
          setFetchLoading(false);
        } catch (err) {
          console.error("Error fetching rent:", err);
          showToast(
            err.response?.data?.error || "Failed to fetch rent details",
            location
          );
          setFetchLoading(false);
        }
      }
    };

    fetchTenants();
    fetchRent();
  }, [id, isEditMode, location]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTenantChange = (e) => {
    const selectedTenantId = e.target.value;
    const selectedTenant = tenants.find(
      (tenant) => tenant._id === selectedTenantId
    );

    if (selectedTenant) {
      setFormData({
        ...formData,
        tenantId: selectedTenantId,
        amount: selectedTenant.roomId.rentAmount,
      });
    } else {
      setFormData({
        ...formData,
        tenantId: "",
        amount: "",
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isEditMode) {
        res = await axios.put(`/rents/${id}`, formData);
      } else {
        res = await axios.post("/rents", formData);
      }

      if (res.data.success) {
        showToast(
          `Rent record ${isEditMode ? "updated" : "created"} successfully`,
          location
        );
        navigate("/rents");
      } else {
        showToast(
          res.data.error ||
            `Failed to ${isEditMode ? "update" : "create"} rent record`,
          location
        );
      }
    } catch (err) {
      console.error("Error saving rent record:", err);
      showToast(
        err.response?.data?.error ||
          `Failed to ${isEditMode ? "update" : "create"} rent record`,
        location
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? "Edit Rent Record" : "Add New Rent Record"}
        </h1>
        <button
          onClick={() => navigate("/rents")}
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Rents
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="tenantId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tenant
              </label>
              <select
                id="tenantId"
                name="tenantId"
                value={tenantId}
                onChange={handleTenantChange}
                className="form-input"
                required
                disabled={isEditMode}
              >
                <option value="">Select a tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name} - Floor {tenant.roomId.floorNumber}, Room{" "}
                    {tenant.roomId.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rent Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={onChange}
                className="form-input"
                required
                min="0"
              />
            </div>

            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Month
              </label>
              <select
                id="month"
                name="month"
                value={month}
                onChange={onChange}
                className="form-input"
                required
                disabled={isEditMode}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={year}
                onChange={onChange}
                className="form-input"
                required
                min="2000"
                max="2100"
                disabled={isEditMode}
              />
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={dueDate}
                onChange={onChange}
                className="form-input"
                required
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={isPaid}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPaid"
                className="ml-2 block text-sm text-gray-700"
              >
                Mark as Paid
              </label>
            </div>
          </div>

          {isPaid && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Payment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="paymentDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Payment Date
                  </label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    value={paymentDate}
                    onChange={onChange}
                    className="form-input"
                    required={isPaid}
                  />
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={onChange}
                    className="form-input"
                    required={isPaid}
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentReference"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    id="paymentReference"
                    name="paymentReference"
                    value={paymentReference}
                    onChange={onChange}
                    className="form-input"
                    placeholder="Transaction ID, Cheque No., etc."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center justify-center w-full md:w-auto"
            >
              <FaSave className="mr-2" />
              {loading ? "Saving..." : "Save Rent Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentForm;
