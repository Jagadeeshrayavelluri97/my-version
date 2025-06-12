import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { showToast } from "../utils/toast";
import {
  FaDoorOpen,
  FaUsers,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaSync,
  FaArrowRight,
  FaPlusCircle,
  FaRegCalendarPlus,
  FaChartLine,
} from "react-icons/fa";
import { getDashboardStats } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    partiallyOccupiedRooms: 0,
    fullyOccupiedRooms: 0,
    totalTenants: 0,
    pendingRents: 0,
    upcomingDueRents: [],
    overdueRents: [],
  });
  const [loading, setLoading] = useState(true);

  // Import useAuth hook
  const { admin } = useAuth();

  // Function to fetch real-time dashboard stats from the database
  const fetchStats = async () => {
    setLoading(true);
    try {
      console.log("Fetching dashboard stats from API...");
      const response = await getDashboardStats();

      if (response.data.success) {
        console.log("Dashboard stats loaded:", response.data.data);
        setStats({
          totalRooms: response.data.data.totalRooms || 0,
          occupiedRooms: response.data.data.occupiedRooms || 0,
          partiallyOccupiedRooms:
            response.data.data.partiallyOccupiedRooms || 0,
          fullyOccupiedRooms: response.data.data.fullyOccupiedRooms || 0,
          totalTenants: response.data.data.totalTenants || 0,
          pendingRents: response.data.data.pendingRents || 0,
          upcomingDueRents: response.data.data.upcomingDueRents || [],
          overdueRents: response.data.data.overdueRents || [],
        });
      } else {
        throw new Error(
          response.data.error || "Failed to fetch dashboard stats"
        );
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      if (err.response && err.response.status === 401) {
        // Clear token and redirect to login page
        localStorage.removeItem("token");
        localStorage.removeItem("adminData");
        navigate("/login");
      } else {
        showToast("Failed to load dashboard data", { type: "error" }, location);
      }
      // Set default values if fetch fails
      setStats({
        totalRooms: 0,
        occupiedRooms: 0,
        partiallyOccupiedRooms: 0,
        fullyOccupiedRooms: 0,
        totalTenants: 0,
        pendingRents: 0,
        upcomingDueRents: [],
        overdueRents: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on component mount and set up auto-refresh
  useEffect(() => {
    fetchStats();

    // Set up auto-refresh every 5 minutes (300000 ms)
    const refreshInterval = setInterval(fetchStats, 300000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <div className="premium-dashboard responsive-container">
        <div className="premium-tenant-loading">
          <div className="premium-tenant-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-dashboard responsive-container">
      <div className="premium-welcome-banner">
        <div className="premium-welcome-content">
          <h1 className="premium-welcome-title">
            Welcome{admin?.name ? `, ${admin.name}` : ''}
          </h1>
          <p className="premium-welcome-subtitle">
            {admin?.pgName ? `${admin.pgName} - ` : ''}Manage your PG hostel efficiently with our comprehensive dashboard
          </p>
        </div>
      </div>

      <div className="premium-dashboard-header">
        <h2 className="premium-dashboard-title">Dashboard Overview</h2>
        <button
          onClick={fetchStats}
          className="premium-refresh-button"
          disabled={loading}
        >
          <FaSync
            className={`premium-refresh-icon ${loading ? "animate-spin" : ""}`}
          />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      <div className="premium-stats-container responsive-grid">
        {/* Rooms Card */}
        <Link to="/rooms" className="premium-stats-card rooms">
          <div className="premium-stats-header">
            <div
              className="premium-stats-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              }}
            >
              <FaDoorOpen className="premium-stats-icon" />
            </div>
            <div className="premium-stats-info">
              <div className="premium-stats-label" style={{ color: "#3b82f6" }}>
                Total Rooms
              </div>
              <div className="premium-stats-value">{stats.totalRooms}</div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {stats.fullyOccupiedRooms} fully occupied,{" "}
              {stats.partiallyOccupiedRooms} partially occupied,{" "}
              {stats.totalRooms - stats.occupiedRooms} vacant
            </p>
            <div className="premium-progress-container">
              <div className="flex h-full">
                <div
                  className="premium-progress-bar"
                  style={{
                    width: `${
                      (stats.fullyOccupiedRooms / stats.totalRooms) * 100
                    }%`,
                    background: "linear-gradient(to right, #3b82f6, #1d4ed8)",
                  }}
                ></div>
                <div
                  className="premium-progress-bar"
                  style={{
                    width: `${
                      (stats.partiallyOccupiedRooms / stats.totalRooms) * 100
                    }%`,
                    background: "linear-gradient(to right, #60a5fa, #3b82f6)",
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="premium-stats-footer">
            <div className="premium-stats-link" style={{ color: "#3b82f6" }}>
              Manage rooms{" "}
              <FaArrowRight className="premium-stats-link-icon" size={12} />
            </div>
          </div>
        </Link>

        {/* Tenants Card */}
        <Link to="/tenants" className="premium-stats-card tenants">
          <div className="premium-stats-header">
            <div
              className="premium-stats-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              <FaUsers className="premium-stats-icon" />
            </div>
            <div className="premium-stats-info">
              <div className="premium-stats-label" style={{ color: "#10b981" }}>
                Total Tenants
              </div>
              <div className="premium-stats-value">{stats.totalTenants}</div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {stats.totalTenants > 0
                ? `${Math.round(
                    (stats.totalTenants / (stats.totalRooms * 2)) * 100
                  )}% occupancy rate`
                : "No tenants registered yet"}
            </p>
            <div className="premium-progress-container">
              <div
                className="premium-progress-bar"
                style={{
                  width: `${Math.min(
                    (stats.totalTenants / (stats.totalRooms * 2)) * 100,
                    100
                  )}%`,
                  background: "linear-gradient(to right, #10b981, #059669)",
                }}
              ></div>
            </div>
          </div>
          <div className="premium-stats-footer">
            <div className="premium-stats-link" style={{ color: "#10b981" }}>
              View all tenants{" "}
              <FaArrowRight className="premium-stats-link-icon" size={12} />
            </div>
          </div>
        </Link>

        {/* Pending Rents Card */}
        <Link to="/rent-management" className="premium-stats-card rents">
          <div className="premium-stats-header">
            <div
              className="premium-stats-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            >
              <FaMoneyBillWave className="premium-stats-icon" />
            </div>
            <div className="premium-stats-info">
              <div className="premium-stats-label" style={{ color: "#f59e0b" }}>
                Pending Rents
              </div>
              <div className="premium-stats-value">{stats.pendingRents}</div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {stats.pendingRents > 0
                ? `${stats.pendingRents} payment${
                    stats.pendingRents !== 1 ? "s" : ""
                  } due`
                : "All rents are paid"}
            </p>
            <div className="premium-progress-container">
              <div
                className="premium-progress-bar"
                style={{
                  width: `${Math.min(
                    (stats.pendingRents / stats.totalTenants) * 100,
                    100
                  )}%`,
                  background: "linear-gradient(to right, #f59e0b, #d97706)",
                }}
              ></div>
            </div>
          </div>
          <div className="premium-stats-footer">
            <div className="premium-stats-link" style={{ color: "#f59e0b" }}>
              View pending rents{" "}
              <FaArrowRight className="premium-stats-link-icon" size={12} />
            </div>
          </div>
        </Link>

        {/* Vacant Rooms Card */}
        <Link to="/rooms" className="premium-stats-card vacant">
          <div className="premium-stats-header">
            <div
              className="premium-stats-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
              }}
            >
              <FaExclamationTriangle className="premium-stats-icon" />
            </div>
            <div className="premium-stats-info">
              <div className="premium-stats-label" style={{ color: "#ef4444" }}>
                Vacant Rooms
              </div>
              <div className="premium-stats-value">
                {stats.totalRooms - stats.occupiedRooms}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {stats.totalRooms - stats.occupiedRooms > 0
                ? `${Math.round(
                    ((stats.totalRooms - stats.occupiedRooms) /
                      stats.totalRooms) *
                      100
                  )}% vacancy rate`
                : "All rooms are occupied"}
            </p>
            <div className="premium-progress-container">
              <div
                className="premium-progress-bar"
                style={{
                  width: `${
                    ((stats.totalRooms - stats.occupiedRooms) /
                      stats.totalRooms) *
                    100
                  }%`,
                  background: "linear-gradient(to right, #ef4444, #dc2626)",
                }}
              ></div>
            </div>
          </div>
          <div className="premium-stats-footer">
            <div className="premium-stats-link" style={{ color: "#ef4444" }}>
              Manage vacant rooms{" "}
              <FaArrowRight className="premium-stats-link-icon" size={12} />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="premium-actions-section">
        <h2 className="premium-actions-title">Quick Actions</h2>
        <div className="premium-actions-grid responsive-flex">
          <Link
            to="/rooms/add"
            className="premium-action-button"
            style={{
              background: "linear-gradient(to right, #3b82f6, #1d4ed8)",
            }}
          >
            <FaPlusCircle className="mr-2" /> Add New Room
          </Link>
          <Link
            to="/tenants/add"
            className="premium-action-button"
            style={{
              background: "linear-gradient(to right, #10b981, #059669)",
            }}
          >
            <FaUsers className="mr-2" /> Add New Tenant
          </Link>
          <Link
            to="/rents/add"
            className="premium-action-button"
            style={{
              background: "linear-gradient(to right, #f59e0b, #d97706)",
            }}
          >
            <FaRegCalendarPlus className="mr-2" /> Record Rent Payment
          </Link>
        </div>
      </div>

      {/* Rent Due Section */}
      <div className="premium-activity-section">
        <h2 className="premium-activity-title">Rent Status</h2>

        {/* Overdue Rents */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            <FaExclamationTriangle className="inline-block mr-2" />
            Overdue Rents ({stats.overdueRents.length})
          </h3>

          {stats.overdueRents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.overdueRents.slice(0, 3).map((rent, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{rent.tenantId?.name}</p>
                      <p className="text-sm text-gray-600">
                        Room {rent.roomId?.roomNumber}, Floor{" "}
                        {rent.roomId?.floorNumber}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {rent.paymentPeriod}ly
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">₹{rent.amount}</p>
                      <p className="text-xs text-red-600">
                        {rent.daysOverdue} days overdue
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Due on: {new Date(rent.dueDate).toLocaleDateString()}</p>
                    <p>Phone: {rent.tenantId?.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-600">No overdue rents! 🎉</p>
            </div>
          )}

          {stats.overdueRents.length > 3 && (
            <div className="mt-2 text-right">
              <Link
                to="/rent-management"
                className="text-red-600 hover:underline text-sm"
              >
                View all {stats.overdueRents.length} overdue rents
                <FaArrowRight className="inline-block ml-1" size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Due Rents */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-amber-600">
            <FaMoneyBillWave className="inline-block mr-2" />
            Upcoming Rent Dues ({stats.upcomingDueRents.length})
          </h3>

          {stats.upcomingDueRents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.upcomingDueRents.slice(0, 3).map((rent, index) => (
                <div
                  key={index}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{rent.tenantId?.name}</p>
                      <p className="text-sm text-gray-600">
                        Room {rent.roomId?.roomNumber}, Floor{" "}
                        {rent.roomId?.floorNumber}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {rent.paymentPeriod}ly
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">₹{rent.amount}</p>
                      <p className="text-xs text-amber-600">
                        Due in{" "}
                        {Math.ceil(
                          (new Date(rent.dueDate) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Due on: {new Date(rent.dueDate).toLocaleDateString()}</p>
                    <p>Phone: {rent.tenantId?.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600">
                No upcoming rent dues in the next 30 days.
              </p>
            </div>
          )}

          {stats.upcomingDueRents.length > 3 && (
            <div className="mt-2 text-right">
              <Link
                to="/rent-management"
                className="text-amber-600 hover:underline text-sm"
              >
                View all {stats.upcomingDueRents.length} upcoming dues
                <FaArrowRight className="inline-block ml-1" size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
