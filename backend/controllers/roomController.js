const Room = require("../models/Room");
const Tenant = require("../models/Tenant");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all rooms for logged in admin
// @route   GET /api/v1/rooms
// @access  Private
exports.getRooms = asyncHandler(async (req, res, next) => {
  // Add adminId filter to only get rooms for the logged-in admin
  req.query.adminId = req.admin.id;

  // Build query
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Room.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Room.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const rooms = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: rooms.length,
    pagination,
    data: rooms,
  });
});

// @desc    Get single room
// @route   GET /api/v1/rooms/:id
// @access  Private
exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure admin owns the room
  if (room.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to access this room`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Create new room
// @route   POST /api/v1/rooms
// @access  Private
exports.createRoom = asyncHandler(async (req, res, next) => {
  // Add adminId to request body
  req.body.adminId = req.admin.id;

  const room = await Room.create(req.body);

  res.status(201).json({
    success: true,
    data: room,
  });
});

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private
exports.updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure admin owns the room
  if (room.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to update this room`, 401)
    );
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Delete room
// @route   DELETE /api/v1/rooms/:id
// @access  Private
exports.deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure admin owns the room
  if (room.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to delete this room`, 401)
    );
  }

  // Check if room has tenants
  if (room.occupiedBeds > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete room with active tenants. Please relocate tenants first.`,
        400
      )
    );
  }

  await room.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Fix room occupancy counts
// @route   GET /api/v1/rooms/fix-occupancy
// @access  Private
exports.fixRoomOccupancy = asyncHandler(async (req, res, next) => {
  // Get admin ID from authenticated user
  const adminId = req.admin.id;

  // Get all rooms for this admin
  const rooms = await Room.find({ adminId });

  let fixedCount = 0;

  // Process each room
  for (const room of rooms) {
    // Count actual tenants in this room
    const tenantCount = await Tenant.countDocuments({
      adminId,
      roomId: room._id,
      active: true,
    });

    // If the counts don't match or isOccupied flag is incorrect, update the room
    if (
      room.occupiedBeds !== tenantCount ||
      room.isOccupied !== (tenantCount === room.capacity)
    ) {
      await Room.findByIdAndUpdate(room._id, {
        occupiedBeds: tenantCount,
        isOccupied: tenantCount === room.capacity,
      });

      fixedCount++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Fixed occupancy counts for ${fixedCount} rooms`,
    data: {},
  });
});

// @desc    Get last updated time for rooms
// @route   GET /api/v1/rooms/last-updated
// @access  Private
exports.getLastUpdatedTime = asyncHandler(async (req, res, next) => {
  const lastUpdatedRoom = await Room.findOne({ adminId: req.admin.id })
    .sort({ updatedAt: -1 })
    .select('updatedAt');

  if (!lastUpdatedRoom) {
    return next(new ErrorResponse(`No rooms found for this admin`, 404));
  }

  res.status(200).json({
    success: true,
    data: {
      lastUpdated: lastUpdatedRoom.updatedAt,
    },
  });
});
