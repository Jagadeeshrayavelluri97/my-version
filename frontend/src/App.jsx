import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/auth.css";
import TenantOnboarding from "./pages/TenantOnboarding";
import { useAuth } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import { TenantProvider } from "./context/TenantContext";

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <RoomProvider>
        <TenantProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/connection-test" element={<ConnectionTest />} />
            <Route path="/tenant-onboarding" element={<TenantOnboarding />} />
            
            {/* Protected Routes nested under Layout */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="rooms/add" element={<RoomForm />} />
              <Route path="rooms/edit/:id" element={<RoomForm />} />
              <Route path="rooms/details/:id" element={<RoomDetails />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenants/add" element={<TenantOnboarding />} />
              <Route path="tenants/edit/:id" element={<TenantForm />} />
              <Route path="rents" element={<Rents />} />
              <Route path="rents/add" element={<RentForm />} />
              <Route path="rents/edit/:id" element={<RentForm />} />
              <Route path="rent-management" element={<RentManagement />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback for unmatched routes - redirect to login if not authenticated, else dashboard */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
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
        </TenantProvider>
      </RoomProvider>
    </div>
  );
}

export default App;
