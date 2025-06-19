const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Admin = require('../models/Admin');
const config = require('../config/config');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log(`Backend: Token received: ${token ? token.substring(0, 10) + '...' + token.substring(token.length - 10) : 'None'}`);
  }

  // Make sure token exists
  if (!token) {
    console.log("Backend: No token found in request headers.");
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log("Backend: Token decoded successfully. Decoded ID:", decoded.id);
    

    req.admin = await Admin.findById(decoded.id);

    if (!req.admin) {
      console.log("Backend: Admin not found for decoded ID:", decoded.id);
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    console.log(`Backend: Admin found: ${req.admin.name}, Route: ${req.originalUrl}`);
    next();
  } catch (err) {
    console.error("Backend: Token verification failed:", err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});
