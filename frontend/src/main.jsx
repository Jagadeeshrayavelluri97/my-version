import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";
import "./styles/logo.css";
import "./styles/amenities.css";
import "./styles/roomCards.css";
import "./styles/rentCards.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/premiumRoomCards.css";
import "./styles/premiumRoomCard.css";
import "./styles/premiumRoomDetails.css";
import "./styles/premiumRoomDetailsExtra.css";
import "./styles/premiumTenantForm.css";
import "./styles/responsive.css";
import "./styles/premiumSidebar.css";
import "./styles/premiumTenantCards.css";
import "./styles/premiumNavbar.css";
import "./styles/matchingRoomCards.css";
import "./styles/sidebar.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { AuthProvider } from "./context/AuthContext";

// Axios configuration is now centralized in src/utils/api.js

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
