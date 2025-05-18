import { toast } from "react-toastify";

// List of routes where toasts should be suppressed
const SUPPRESSED_ROUTES = ["/login", "/logout", "/register"];

// Use this function everywhere instead of direct toast calls
export function showToast(message, options = {}, location) {
  // If on a suppressed route and not a login/register toast, do not show
  if (
    location &&
    SUPPRESSED_ROUTES.includes(location.pathname) &&
    !options.force // use force: true for login/register toasts
  ) {
    return;
  }
  toast(message, options);
} 