import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Container, Row, Col } from 'react-bootstrap';

const Layout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <Container fluid className="py-4 px-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;
