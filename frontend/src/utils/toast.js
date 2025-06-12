import { toast } from "react-toastify";

// List of routes where toasts should be suppressed
const SUPPRESSED_ROUTES = ["/login", "/logout", "/register"];

// API error messages that should be replaced with a login message
const API_ERROR_MESSAGES = [
  "Failed to fetch rooms",
  "Failed to fetch tenants",
  "Failed to load dashboard data",
  "Failed to fetch",
  "Not authorized",
  "Session expired",
  "401",
];

// Global flag to track if login message is shown
if (typeof window !== "undefined") {
  window.loginMessageShown = window.loginMessageShown || false;
  window.loginMessageTimer = window.loginMessageTimer || null;
}

// Use this function everywhere instead of direct toast calls
export const showToast = (message, options = {}, location = null) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const toastOptions = { ...defaultOptions, ...options };

  // If on a login route and it's an API error message, show "Please login first" instead
  if (
    location &&
    SUPPRESSED_ROUTES.includes(location.pathname) &&
    (API_ERROR_MESSAGES.some((errorMsg) =>
      message.toLowerCase().includes(errorMsg.toLowerCase())
    ) ||
      (options.type === "error" && !options.force))
  ) {
    // Only show the login message if it's not already shown (prevent duplicates)
    if (!window.loginMessageShown) {
      toast.dismiss(); // Dismiss any existing toasts
      toast("Please login first", {
        type: "info",
        autoClose: 3000,
        toastId: "login-message", // Unique ID prevents duplicates
      });

      window.loginMessageShown = true;

      // Clear any existing timer
      if (window.loginMessageTimer) {
        clearTimeout(window.loginMessageTimer);
      }

      // Reset the flag after 5 seconds to prevent multiple messages
      window.loginMessageTimer = setTimeout(() => {
        window.loginMessageShown = false;
        window.loginMessageTimer = null;
      }, 5000);
    }
    return;
  }
  // If on a suppressed route and not a login/register toast, do not show
  if (
    location &&
    SUPPRESSED_ROUTES.includes(location.pathname) &&
    !options.force // use force: true for login/register toasts
  ) {
    return;
  }

  switch (options.type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast.warning(message, toastOptions);
      break;
    case 'info':
      toast.info(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }
};
