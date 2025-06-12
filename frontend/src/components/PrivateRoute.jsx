import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { showToast } from "../utils/toast";

const PrivateRoute = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const [hasLocalToken, setHasLocalToken] = useState(true);

  // Check for token on mount and whenever isAuthenticated changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminData = localStorage.getItem("adminData");

    // Update local state based on token presence
    setHasLocalToken(!!token && !!adminData);

    // If not authenticated and no token, show a message
    if (!isAuthenticated && !token) {
      showToast(
        "Please login to access this page",
        { type: "info" },
        { pathname: "/login" }
      );
    }
  }, [isAuthenticated]);

  // If we have a token in localStorage OR we're authenticated according to context
  // then allow access to the protected route
  if (hasLocalToken || isAuthenticated) {
    return children;
  }

  // Otherwise redirect to login
  return <Navigate to="/login" />;
};

export default PrivateRoute;
