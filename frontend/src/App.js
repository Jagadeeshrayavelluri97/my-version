import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import RoomForm from './pages/RoomForm';
import Tenants from './pages/Tenants';
import TenantForm from './pages/TenantForm';
import Rents from './pages/Rents';
import RentForm from './pages/RentForm';
import Profile from './pages/Profile';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Context
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/add" element={<RoomForm />} />
          <Route path="rooms/edit/:id" element={<RoomForm />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="tenants/add" element={<TenantForm />} />
          <Route path="tenants/edit/:id" element={<TenantForm />} />
          <Route path="rents" element={<Rents />} />
          <Route path="rents/add" element={<RentForm />} />
          <Route path="rents/edit/:id" element={<RentForm />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to dashboard if logged in, otherwise to login */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
