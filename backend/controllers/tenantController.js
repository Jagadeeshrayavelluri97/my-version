const Tenant = require("../models/Tenant");
const Room = require("../models/Room");
const Rent = require("../models/Rent");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Tesseract = require('node-tesseract-ocr');
const sharp = require('sharp');

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

// @desc    Process Aadhaar Image for OCR
// @route   POST /api/v1/tenants/aadhaar-ocr
// @access  Private
exports.processAadhaarImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('No Aadhaar image uploaded', 400));
  }

  const imageBuffer = req.file.buffer;

  try {
    // Preprocess image with sharp for better OCR accuracy
    // Convert to grayscale, enhance contrast, and optionally resize
    const processedImageBuffer = await sharp(imageBuffer)
      .grayscale()
      .normalize() // Enhance contrast
      .resize({ width: 1500, fit: 'inside' }) // Increase resolution for OCR
      .png() // Convert to PNG for Tesseract
      .toBuffer();

    const config = {
      lang: 'eng',
      oem: 1, // OCR Engine Mode: 1 for Neural nets LSTM, 0 for Legacy, 2 for both, 3 for TesseractOnly
      psm: 6, // Page Segmentation Mode: 6 for Assume a single uniform block of text.
    };

    const text = await Tesseract.recognize(processedImageBuffer, config.lang, config);
    console.log("OCR Raw Text:", text);

    // Basic parsing logic (this needs to be refined based on actual Aadhaar card layout)
    let extractedData = {
      name: '',
      idProofNumber: '',
      dob: '',
      gender: '',
      address: '',
    };

    // Example: Extracting Name (very basic, needs robust regex for real use)
    const nameMatch = text.match(/(Name|N ame|Nom|N om)\s*[:.]?\s*([A-Za-z.\s]+)/i);
    if (nameMatch && nameMatch[2]) {
      extractedData.name = nameMatch[2].trim();
    }

    // Example: Extracting Aadhaar Number (usually 12 digits, often in 4-digit groups)
    // This regex looks for 12 digits, optionally separated by spaces
    const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    if (aadhaarMatch) {
      extractedData.idProofNumber = aadhaarMatch[0].replace(/\s/g, ''); // Remove spaces
    }

    // Example: Extracting Date of Birth (DD/MM/YYYY or DD-MM-YYYY or YYYY)
    const dobMatch = text.match(/(\d{2}[/\\-]\d{2}[/\\-]\d{4}|Year Of Birth\s*:\s*(\d{4})|DOB\s*:\s*(\d{2}\/\d{2}\/\d{4}))/i);
    if (dobMatch) {
        if (dobMatch[2]) { // For "Year Of Birth : YYYY"
            extractedData.dob = dobMatch[2];
        } else if (dobMatch[3]) { // For "DOB: DD/MM/YYYY"
            extractedData.dob = dobMatch[3].replace(/\//g, '-'); // Convert to DD-MM-YYYY
        } else {
            extractedData.dob = dobMatch[0].replace(/\//g, '-'); // Convert to DD-MM-YYYY
        }
    }
    // Attempt to convert to YYYY-MM-DD if DD-MM-YYYY
    if (extractedData.dob.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const parts = extractedData.dob.split('-');
        if (parts.length === 3) {
            extractedData.dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }


    // Example: Extracting Gender (Male/Female/M/F)
    const genderMatch = text.match(/(Male|Female|M\b|F\b)/i);
    if (genderMatch) {
      extractedData.gender = genderMatch[0];
      if (extractedData.gender.toLowerCase() === 'm') extractedData.gender = 'Male';
      if (extractedData.gender.toLowerCase() === 'f') extractedData.gender = 'Female';
    }

    // Example: Extracting Address (very complex, usually needs more advanced OCR/NLP)
    // This is a very simplistic approach, assuming address is after a keyword
    const addressKeywords = /(Address|Addr|Add|VTC|Locality|Street|Road|Area|Taluk|Dist|State|Pin code|PIN)/i;
    const addressStartIndex = text.search(addressKeywords);
    if (addressStartIndex !== -1) {
        let potentialAddress = text.substring(addressStartIndex);
        // This is a very rough cut, in a real scenario you'd use more context or NLP
        const lines = potentialAddress.split('\n').slice(0, 4); // Take next few lines
        extractedData.address = lines.join(' ').replace(addressKeywords, '').trim().replace(/\s{2,}/g, ' ');
    }


    res.status(200).json({
      success: true,
      data: extractedData,
      rawOcrText: text, // Include raw OCR text for debugging
    });

  } catch (err) {
    console.error("Aadhaar OCR Processing Error:", err);
    return next(new ErrorResponse(`Failed to process Aadhaar image: ${err.message}`, 500));
  }
});
