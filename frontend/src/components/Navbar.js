import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUserCog, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { admin, logout, loading } = useAuth();

  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {loading ? (
              <Spinner animation="border" size="sm" className="me-3" />
            ) : admin && admin.name && admin.pgName ? (
              <div className="d-flex flex-column align-items-end me-3">
                <span className="fw-bold text-primary" style={{ fontSize: '1rem' }}>
                  <FaUserCircle className="me-1" /> {admin.name}
                </span>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  <FaBuilding className="me-1" /> {admin.pgName}
                </span>
              </div>
            ) : null}
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-basic" className="border-0 bg-transparent">
                <FaUserCircle size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">
                  <FaUserCog className="me-2" /> Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout}>
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
