import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaHome,
  FaBed,
  FaMoneyBillWave,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { admin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/rooms", icon: FaBed, label: "Rooms" },
    {
      path: "/rent-management",
      icon: FaMoneyBillWave,
      label: "Rent Management",
    },
    { path: "/tenants", icon: FaUsers, label: "Tenants" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side */}
        <div className="navbar-left">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="menu-button"
          >
            <FaBars size={20} />
          </button>

          {/* Logo and App Name (Mobile Only) */}
          <div className="navbar-mobile-logo-text">
            <img
              src="/sebzy1-removebg-preview.png"
              alt="Sebzy Logo"
              className="logo-image-mobile"
            />
            <div className="flex flex-col">
              <div className="text-xl font-bold text-white">Sebzy</div>
              <div className="text-xs font-semibold text-indigo-300">
                PG Management
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                <link.icon size={16} className="nav-link-icon" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {/* Profile dropdown */}
          <div ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="profile-button"
            >
              <div className="profile-info">
                <div className="profile-avatar">
                  <FaUserCircle size={20} />
                </div>
                <div className="profile-text">
                  <span className="profile-name">{admin?.name || "User"}</span>
                  <span className="profile-pg">
                    {admin?.pgName || "PG Name"}
                  </span>
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <p className="profile-menu-name">{admin?.name || "User"}</p>
                  <p className="profile-menu-email">
                    {admin?.email || "user@example.com"}
                  </p>
                </div>
                <div className="profile-menu-items">
                  <Link to="/profile" className="profile-menu-item">
                    <FaUser size={14} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/settings" className="profile-menu-item">
                    <FaCog size={14} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="profile-menu-item logout-button"
                  >
                    <FaSignOutAlt size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
