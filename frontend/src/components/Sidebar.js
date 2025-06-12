import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaDoorOpen, FaUsers, FaMoneyBillWave, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { admin } = useAuth();

  return (
    <div className="sidebar d-flex flex-column flex-shrink-0 p-3 text-white" style={{ width: '250px' }}>
      <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">PG Management</span>
      </div>
      <hr />
      <div className="text-center mb-3">
        <FaUserCircle size={50} className="mb-2" />
        <div className="fw-bold">{admin?.pgName}</div>
        <div className="small">{admin?.email}</div>
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`}>
            <FaTachometerAlt className="me-2" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/rooms" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`}>
            <FaDoorOpen className="me-2" />
            Rooms
          </NavLink>
        </li>
        <li>
          <NavLink to="/tenants" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`}>
            <FaUsers className="me-2" />
            Tenants
          </NavLink>
        </li>
        <li>
          <NavLink to="/rents" className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`}>
            <FaMoneyBillWave className="me-2" />
            Rent
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
