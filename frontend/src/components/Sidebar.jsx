import React, { useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaTachometerAlt,
  FaDoorOpen,
  FaUsers,
  FaUserCircle,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { admin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on location change (mobile only), but not when sidebar is just opened
  const prevLocation = useRef(location);

  useEffect(() => {
    // Only close if the location actually changed and sidebar is open
    if (sidebarOpen && prevLocation.current.pathname !== location.pathname) {
      setSidebarOpen(false);
    }

    // Update the previous location
    prevLocation.current = location;
  }, [location, setSidebarOpen, sidebarOpen]);

  const handleNavigation = (path) => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    navigate(path);
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      <div
        className={`fixed inset-0 z-20 transition-opacity premium-sidebar-backdrop lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
        style={{
          willChange: "opacity",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      ></div>

      <div className="premium-sidebar" style={{ height: "100%" }}>
        <div className="premium-sidebar-content">
          <div className="premium-sidebar-logo flex items-center justify-between">
            <div
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center cursor-pointer"
            >
              <div className="logo-container mr-3">
                <img
                  src="/sebzy1-removebg-preview.png"
                  alt="Sebzy Logo"
                  className="logo-image"
                  style={{ maxWidth: "40px", maxHeight: "40px" }}
                />
              </div>

              <div className="flex flex-col">
                <div className="text-2xl font-bold text-white">Sebzy</div>
                <div className="text-sm font-semibold text-indigo-300">
                  PG Management
                </div>
              </div>
            </div>

            <button
              className="text-white focus:outline-none lg:hidden hover:text-indigo-300 transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          <div className="premium-sidebar-profile">
            <div
              onClick={() => handleNavigation("/profile")}
              className="flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-white hover:bg-opacity-5 cursor-pointer"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                <FaUserCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {admin?.name || "User"}
                </p>
                <p className="text-xs text-indigo-300">
                  {admin?.pgName || "PG Name"}
                </p>
              </div>
            </div>
          </div>

          <nav className="premium-sidebar-nav">
            <div
              onClick={() => handleNavigation("/dashboard")}
              className={`premium-sidebar-link ${
                location.pathname === "/dashboard" ? "active" : ""
              } cursor-pointer`}
            >
              <div className="premium-sidebar-icon">
                <FaTachometerAlt className="h-4 w-4" />
              </div>
              <span className="premium-sidebar-text">Dashboard</span>
            </div>

            <div
              onClick={() => handleNavigation("/rooms")}
              className={`premium-sidebar-link ${
                location.pathname === "/rooms" ? "active" : ""
              } cursor-pointer`}
            >
              <div className="premium-sidebar-icon">
                <FaDoorOpen className="h-4 w-4" />
              </div>
              <span className="premium-sidebar-text">Rooms</span>
            </div>

            <div
              onClick={() => handleNavigation("/tenants")}
              className={`premium-sidebar-link ${
                location.pathname === "/tenants" ? "active" : ""
              } cursor-pointer`}
            >
              <div className="premium-sidebar-icon">
                <FaUsers className="h-4 w-4" />
              </div>
              <span className="premium-sidebar-text">Tenants</span>
            </div>

            <div
              onClick={() => handleNavigation("/rent-management")}
              className={`premium-sidebar-link ${
                location.pathname === "/rent-management" ? "active" : ""
              } cursor-pointer`}
            >
              <div className="premium-sidebar-icon">
                <FaFileInvoiceDollar className="h-4 w-4" />
              </div>
              <span className="premium-sidebar-text">Rent Management</span>
            </div>
          </nav>

          <div className="premium-sidebar-footer">
            <p>© {new Date().getFullYear()} Sebzy PG Management</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
