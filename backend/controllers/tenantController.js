const Tenant = require("../models/Tenant");
const Room = require("../models/Room");
const Rent = require("../models/Rent");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all tenants for logged in admin
// @route   GET /api/v1/tenants
// @access  Private
exports.getTenants = asyncHandler(async (req, res, next) => {
  // Add adminId filter to only get tenants for the logged-in admin
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
  query = Tenant.find(JSON.parse(queryStr)).populate("roomId");

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
  const total = await Tenant.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const tenants = await query;

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
    count: tenants.length,
    pagination,
    data: tenants,
  });
});

// @desc    Get single tenant
// @route   GET /api/v1/tenants/:id
// @access  Private
exports.getTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id).populate("roomId");

  if (!tenant) {
    return next(
      new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure admin owns the tenant
  if (tenant.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to access this tenant`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: tenant,
  });
});

// @desc    Create new tenant
// @route   POST /api/v1/tenants
// @access  Private
exports.createTenant = asyncHandler(async (req, res, next) => {
  // Add adminId to request body
  req.body.adminId = req.admin.id;

  // Check if room exists and belongs to admin
  const room = await Room.findById(req.body.roomId);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.body.roomId}`, 404)
    );
  }

  // Make sure admin owns the room
  if (room.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to add tenant to this room`, 401)
    );
  }

  try {
    // Count actual tenants in this room
    const tenantCount = await Tenant.countDocuments({
      adminId: req.admin.id,
      roomId: room._id,
      active: true,
    });

    // Update room with accurate count (add 1 for the new tenant)
    await Room.findByIdAndUpdate(room._id, {
      occupiedBeds: tenantCount + 1,
      isOccupied: tenantCount + 1 === room.capacity,
    });

    console.log(
      `Room ${room._id} updated: occupiedBeds=${tenantCount + 1}, isOccupied=${
        tenantCount + 1 === room.capacity
      }`
    );
  } catch (err) {
    console.error("Error updating room occupancy:", err);
    // Continue with tenant creation even if room update fails
  }

  const tenant = await Tenant.create(req.body);

  res.status(201).json({
    success: true,
    data: tenant,
  });
});

// @desc    Update tenant
// @route   PUT /api/v1/tenants/:id
// @access  Private
exports.updateTenant = asyncHandler(async (req, res, next) => {
  let tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(
      new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure admin owns the tenant
  if (tenant.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to update this tenant`, 401)
    );
  }

  // If roomId is being changed, check if new room exists and belongs to admin
  if (req.body.roomId && req.body.roomId !== tenant.roomId.toString()) {
    const newRoom = await Room.findById(req.body.roomId);

    if (!newRoom) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.body.roomId}`, 404)
      );
    }

    // Make sure admin owns the new room
    if (newRoom.adminId.toString() !== req.admin.id) {
      return next(
        new ErrorResponse(
          `Admin not authorized to move tenant to this room`,
          401
        )
      );
    }

    try {
      // Update old room occupancy
      const oldRoom = await Room.findById(tenant.roomId);

      if (oldRoom) {
        // Count actual tenants in old room (excluding the one being moved)
        const oldRoomTenantCount = await Tenant.countDocuments({
          adminId: req.admin.id,
          roomId: oldRoom._id,
          active: true,
          _id: { $ne: tenant._id }, // Exclude the tenant being moved
        });

        // Update old room with accurate count
        await Room.findByIdAndUpdate(oldRoom._id, {
          occupiedBeds: oldRoomTenantCount,
          isOccupied: oldRoomTenantCount === oldRoom.capacity,
        });

        console.log(
          `Old Room ${
            oldRoom._id
          } updated: occupiedBeds=${oldRoomTenantCount}, isOccupied=${
            oldRoomTenantCount === oldRoom.capacity
          }`
        );
      }

      // Update new room occupancy
      const newRoom = await Room.findById(req.body.roomId);

      if (newRoom) {
        // Count actual tenants in new room
        const newRoomTenantCount = await Tenant.countDocuments({
          adminId: req.admin.id,
          roomId: newRoom._id,
          active: true,
        });

        // Update new room with accurate count (add 1 for the tenant being moved)
        await Room.findByIdAndUpdate(newRoom._id, {
          occupiedBeds: newRoomTenantCount + 1,
          isOccupied: newRoomTenantCount + 1 === newRoom.capacity,
        });

        console.log(
          `New Room ${newRoom._id} updated: occupiedBeds=${
            newRoomTenantCount + 1
          }, isOccupied=${newRoomTenantCount + 1 === newRoom.capacity}`
        );
      }
    } catch (err) {
      console.error("Error updating room occupancy:", err);
      // Continue with tenant update even if room update fails
    }
  }

  tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: tenant,
  });
});

// @desc    Delete tenant
// @route   DELETE /api/v1/tenants/:id
// @access  Private
exports.deleteTenant = asyncHandler(async (req, res, next) => {
  let tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(
      new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure admin owns the tenant
  if (tenant.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to delete this tenant`, 401)
    );
  }

  try {
    // Decrement occupied beds in the associated room
    const room = await Room.findById(tenant.roomId);
    if (room) {
      await Room.findByIdAndUpdate(room._id, {
        $inc: { occupiedBeds: -1 },
        isOccupied: false, // Set to false if no more tenants are in the room
      });
    }

    // Delete associated rents
    await Rent.deleteMany({ tenantId: tenant._id });

    await tenant.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error("Error during tenant deletion:", err);
    return next(new ErrorResponse(`Error deleting tenant: ${err.message}`, 500));
  }
});

// @desc    Get last updated tenant for logged in admin
// @route   GET /api/v1/tenants/last-updated
// @access  Private
exports.getLastUpdatedTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findOne({ adminId: req.admin.id })
    .sort({ updatedAt: -1 })
    .populate("roomId");

  if (!tenant) {
    return next(new ErrorResponse(`No tenants found for this admin`, 404));
  }

  res.status(200).json({
    success: true,
    data: tenant,
  });
});
