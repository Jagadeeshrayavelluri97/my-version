import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import RoomForm from "./pages/RoomForm";
import RoomDetails from "./pages/RoomDetails";
import Tenants from "./pages/Tenants";
import TenantForm from "./pages/TenantForm";
import Rents from "./pages/Rents";
import RentForm from "./pages/RentForm";
import RentManagement from "./pages/RentManagement";
import Profile from "./pages/Profile";
import ConnectionTest from "./pages/ConnectionTest";

// Components
import Layout from "./components/Layout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Context
import { RoomProvider } from "./context/RoomContext";
import { TenantProvider } from "./context/TenantContext";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, loading, admin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen responsive-container">
        <div className="premium-tenant-spinner"></div>
      </div>
    );
  }

  return (
    <RoomProvider>
      <TenantProvider>
        <div className="app">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={1}
          />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
              }
            />
            <Route path="/connection-test" element={<ConnectionTest />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="rooms/add" element={<RoomForm />} />
              <Route path="rooms/edit/:id" element={<RoomForm />} />
              <Route path="rooms/details/:id" element={<RoomDetails />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenants/add" element={<TenantForm />} />
              <Route path="tenants/edit/:id" element={<TenantForm />} />
              <Route path="rents" element={<Rents />} />
              <Route path="rents/add" element={<RentForm />} />
              <Route path="rents/edit/:id" element={<RentForm />} />
              <Route path="rent-management" element={<RentManagement />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch all - redirect to dashboard if logged in, otherwise to login */}
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </TenantProvider>
    </RoomProvider>
  );
}

export default App;
