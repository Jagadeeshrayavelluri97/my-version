import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { showToast } from "../utils/toast";

const Rents = () => {
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchRents = async () => {
      try {
        const res = await axios.get("/rents");
        if (res.data.success) {
          setRents(res.data.data);
        } else {
          setRents([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rents:", err);
        showToast("Failed to fetch rent records", location);
        setRents([]);
        setLoading(false);
      }
    };

    fetchRents();
  }, [location]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rent record?")) {
      try {
        const res = await axios.delete(`/rents/${id}`);
        if (res.data.success) {
          setRents(rents.filter((rent) => rent._id !== id));
          showToast("Rent record deleted successfully", location);
        } else {
          showToast(res.data.error || "Failed to delete rent record", location);
        }
      } catch (err) {
        console.error("Error deleting rent record:", err);
        showToast(
          err.response?.data?.error || "Failed to delete rent record",
          location
        );
      }
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const paymentData = {
        isPaid: true,
        paymentDate: new Date().toISOString(),
        paymentMethod: "Cash",
      };

      const res = await axios.put(`/rents/${id}/pay`, paymentData);

      if (res.data.success) {
        setRents(
          rents.map((rent) =>
            rent._id === id ? { ...rent, ...paymentData } : rent
          )
        );
        showToast("Rent marked as paid successfully", location);
      } else {
        showToast(res.data.error || "Failed to mark rent as paid", location);
      }
    } catch (err) {
      console.error("Error updating rent record:", err);
      showToast(err.response?.data?.error || "Failed to mark rent as paid", location);
    }
  };

  const getMonthName = (month) => {
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
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Rent Records</h1>
        <Link to="/rents/add" className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" /> Add Rent Record
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tenant
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Room
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Period
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Due Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rents.map((rent) => (
                <tr key={rent._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rent.tenantId ? rent.tenantId.name : "Unknown Tenant"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {rent.roomId
                        ? `Floor ${rent.roomId.floorNumber}, Room ${rent.roomId.roomNumber}`
                        : "Unknown Room"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getMonthName(rent.month)} {rent.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{rent.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(rent.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rent.isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {rent.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {rent.isPaid ? (
                        <>
                          <div>
                            Date:{" "}
                            {new Date(rent.paymentDate).toLocaleDateString()}
                          </div>
                          <div>Method: {rent.paymentMethod}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {!rent.isPaid && (
                        <button
                          onClick={() => handleMarkAsPaid(rent._id)}
                          className="flex items-center px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          title="Mark as Paid"
                        >
                          <FaCheck className="mr-1" /> Mark Paid
                        </button>
                      )}
                      <Link
                        to={`/rents/edit/${rent._id}`}
                        className="flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(rent._id)}
                        className="flex items-center px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rents;
