const Rent = require("../models/Rent");
const Tenant = require("../models/Tenant");
const Room = require("../models/Room");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get all rent records for logged in admin
// @route   GET /api/v1/rents
// @access  Private
exports.getRents = asyncHandler(async (req, res, next) => {
  // Add adminId filter to only get rents for the logged-in admin
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
  query = Rent.find(JSON.parse(queryStr))
    .populate({
      path: "tenantId",
      select: "name phone",
    })
    .populate({
      path: "roomId",
      select: "floorNumber roomNumber",
    });

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
    query = query.sort("-year -month");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Rent.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const rents = await query;

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
    count: rents.length,
    pagination,
    data: rents,
  });
});

// @desc    Get single rent record
// @route   GET /api/v1/rents/:id
// @access  Private
exports.getRent = asyncHandler(async (req, res, next) => {
  const rent = await Rent.findById(req.params.id)
    .populate({
      path: "tenantId",
      select: "name phone",
    })
    .populate({
      path: "roomId",
      select: "floorNumber roomNumber",
    });

  if (!rent) {
    return next(
      new ErrorResponse(
        `Rent record not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure admin owns the rent record
  if (rent.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to access this rent record`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: rent,
  });
});

// @desc    Create new rent record
// @route   POST /api/v1/rents
// @access  Private
exports.createRent = asyncHandler(async (req, res, next) => {
  // Add adminId to request body
  req.body.adminId = req.admin.id;

  // Check if tenant exists and belongs to admin
  const tenant = await Tenant.findById(req.body.tenantId);

  if (!tenant) {
    return next(
      new ErrorResponse(`Tenant not found with id of ${req.body.tenantId}`, 404)
    );
  }

  // Make sure admin owns the tenant
  if (tenant.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(
        `Admin not authorized to create rent for this tenant`,
        401
      )
    );
  }

  // Add roomId from tenant
  req.body.roomId = tenant.roomId;

  // Check if rent record already exists for this tenant, month, and year
  const existingRent = await Rent.findOne({
    tenantId: req.body.tenantId,
    month: req.body.month,
    year: req.body.year,
  });

  if (existingRent) {
    return next(
      new ErrorResponse(
        `Rent record already exists for this tenant for ${req.body.month}/${req.body.year}`,
        400
      )
    );
  }

  const rent = await Rent.create(req.body);

  res.status(201).json({
    success: true,
    data: rent,
  });
});

// @desc    Update rent record (mark as paid/unpaid)
// @route   PUT /api/v1/rents/:id
// @access  Private
exports.updateRent = asyncHandler(async (req, res, next) => {
  let rent = await Rent.findById(req.params.id);

  if (!rent) {
    return next(
      new ErrorResponse(
        `Rent record not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure admin owns the rent record
  if (rent.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to update this rent record`, 401)
    );
  }

  // If marking as paid, add payment date
  if (req.body.isPaid && !rent.isPaid) {
    req.body.paymentDate = Date.now();
  }

  rent = await Rent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: rent,
  });
});

// @desc    Delete rent record
// @route   DELETE /api/v1/rents/:id
// @access  Private
exports.deleteRent = asyncHandler(async (req, res, next) => {
  const rent = await Rent.findById(req.params.id);

  if (!rent) {
    return next(
      new ErrorResponse(
        `Rent record not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure admin owns the rent record
  if (rent.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to delete this rent record`, 401)
    );
  }

  await rent.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Create rent records automatically for tenants
// @route   POST /api/v1/rents/create-auto
// @access  Private
exports.createAutoRents = asyncHandler(async (req, res, next) => {
  const adminId = req.admin.id;
  const { rentData } = req.body;

  if (!rentData || !Array.isArray(rentData) || rentData.length === 0) {
    return next(new ErrorResponse("Please provide valid rent data", 400));
  }

  const createdRents = [];
  const errors = [];

  // Process each rent record
  for (const rentItem of rentData) {
    try {
      // Validate required fields
      if (
        !rentItem.tenantId ||
        !rentItem.month ||
        !rentItem.year ||
        !rentItem.amount ||
        !rentItem.dueDate
      ) {
        errors.push({
          message: "Missing required fields",
          data: rentItem,
        });
        continue;
      }

      // Check if tenant exists and belongs to admin
      const tenant = await Tenant.findById(rentItem.tenantId);
      if (!tenant) {
        errors.push({
          message: `Tenant not found with id of ${rentItem.tenantId}`,
          data: rentItem,
        });
        continue;
      }

      // Make sure admin owns the tenant
      if (tenant.adminId.toString() !== adminId) {
        errors.push({
          message: "Admin not authorized to create rent for this tenant",
          data: rentItem,
        });
        continue;
      }

      // Check if rent record already exists for this tenant, month, and year
      const existingRent = await Rent.findOne({
        tenantId: rentItem.tenantId,
        month: rentItem.month,
        year: rentItem.year,
      });

      if (existingRent) {
        errors.push({
          message: `Rent record already exists for this tenant for ${rentItem.month}/${rentItem.year}`,
          data: rentItem,
          existingRentId: existingRent._id,
        });
        continue;
      }

      // Create the rent record
      const newRent = await Rent.create({
        tenantId: rentItem.tenantId,
        roomId: tenant.roomId,
        adminId,
        amount: rentItem.amount,
        month: rentItem.month,
        year: rentItem.year,
        dueDate: new Date(rentItem.dueDate),
        isPaid: false,
      });

      createdRents.push(newRent);
    } catch (err) {
      errors.push({
        message: err.message,
        data: rentItem,
      });
    }
  }

  res.status(201).json({
    success: true,
    count: createdRents.length,
    data: createdRents,
    errors: errors.length > 0 ? errors : undefined,
  });
});

// @desc    Mark rent as paid
// @route   PUT /api/v1/rents/:id/pay
// @access  Private
exports.markRentAsPaid = asyncHandler(async (req, res, next) => {
  let rent = await Rent.findById(req.params.id);

  if (!rent) {
    return next(
      new ErrorResponse(
        `Rent record not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure admin owns the rent record
  if (rent.adminId.toString() !== req.admin.id) {
    return next(
      new ErrorResponse(`Admin not authorized to update this rent record`, 401)
    );
  }

  const paymentAmount = req.body.amount || rent.amount;
  const isFullPayment = paymentAmount >= rent.amount;

  // Create payment history entry
  const paymentEntry = {
    amount: paymentAmount,
    date: new Date(),
    method: req.body.paymentMethod || "Cash",
    reference: req.body.paymentReference || "",
    notes: req.body.notes || "",
  };

  // Update payment details
  const paymentData = {
    amountPaid: Math.min(rent.amountPaid + paymentAmount, rent.amount),
    isPaid: isFullPayment,
    status: isFullPayment
      ? "Paid"
      : paymentAmount > 0
      ? "Partially Paid"
      : "Pending",
    paymentDate: isFullPayment ? new Date() : undefined,
    paymentMethod: req.body.paymentMethod || "Cash",
    paymentReference: req.body.paymentReference || "",
    $push: { paymentHistory: paymentEntry },
  };

  rent = await Rent.findByIdAndUpdate(req.params.id, paymentData, {
    new: true,
    runValidators: true,
  });

  // If fully paid, calculate next month's rent due date
  let nextRent = null;
  if (isFullPayment) {
    // Get tenant details to get joining date, room ID and rent amount
    const tenant = await Tenant.findById(rent.tenantId).populate("roomId");

    if (tenant && tenant.active && tenant.joiningDate) {
      // Calculate the next due date based on the tenant's joining date pattern
      const joinDate = new Date(tenant.joiningDate);
      const dueDate = new Date(rent.dueDate);

      // Calculate next month's due date
      let nextDueDate = new Date(dueDate);
      nextDueDate.setMonth(dueDate.getMonth() + 1);

      // Keep the same day of month as the joining date
      nextDueDate.setDate(joinDate.getDate());

      // Get the month and year for the next due date
      const nextMonth = nextDueDate.getMonth() + 1; // Convert from 0-indexed to 1-indexed
      const nextYear = nextDueDate.getFullYear();

      // Check if next month's rent record already exists
      const existingNextRent = await Rent.findOne({
        tenantId: rent.tenantId,
        month: nextMonth,
        year: nextYear,
      });

      // If next month's rent doesn't exist, create it
      if (!existingNextRent && tenant.roomId) {
        console.log(
          `Creating next month's rent record for tenant ${tenant.name} for ${nextMonth}/${nextYear}`
        );

        nextRent = await Rent.create({
          tenantId: rent.tenantId,
          roomId: tenant.roomId._id,
          adminId: req.admin.id,
          amount: tenant.roomId.rentAmount,
          month: nextMonth,
          year: nextYear,
          dueDate: nextDueDate,
          status: "Pending",
          isPaid: false,
        });

        console.log(
          `Created next rent record with ID: ${
            nextRent._id
          }, due date: ${nextDueDate.toISOString()}`
        );
      } else if (existingNextRent) {
        console.log(
          `Next month's rent record already exists for tenant ${tenant.name} for ${nextMonth}/${nextYear}`
        );
        nextRent = existingNextRent;
      }
    } else {
      console.log(
        `Tenant not found or inactive or missing joining date: ${rent.tenantId}`
      );
    }
  }

  res.status(200).json({
    success: true,
    data: rent,
    nextRent: nextRent,
  });
});

// @desc    Get upcoming rent dues (next 7 days)
// @route   GET /api/v1/rents/upcoming
// @access  Private
exports.getUpcomingRents = asyncHandler(async (req, res, next) => {
  const adminId = req.admin.id;

  // Calculate date range for upcoming dues (next 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Find upcoming rent dues
  const upcomingRents = await Rent.find({
    adminId,
    dueDate: { $gte: today, $lte: nextWeek },
    isPaid: false,
  })
    .populate({
      path: "tenantId",
      select: "name phone email paymentPeriod",
    })
    .populate({
      path: "roomId",
      select: "floorNumber roomNumber",
    });

  // Enhance upcoming rents with days until due
  const upcomingRentsWithDays = upcomingRents.map((rent) => {
    const dueDate = new Date(rent.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return {
      ...rent.toObject(),
      daysUntilDue,
    };
  });

  res.status(200).json({
    success: true,
    count: upcomingRentsWithDays.length,
    data: upcomingRentsWithDays,
  });
});

// @desc    Get overdue rent payments
// @route   GET /api/v1/rents/overdue
// @access  Private
exports.getOverdueRents = asyncHandler(async (req, res, next) => {
  const adminId = req.admin.id;

  // Get current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find overdue rent payments from existing records
  const overdueRents = await Rent.find({
    adminId,
    dueDate: { $lt: today },
    isPaid: false,
  })
    .populate({
      path: "tenantId",
      select: "name phone email joiningDate paymentPeriod",
    })
    .populate({
      path: "roomId",
      select: "floorNumber roomNumber rentAmount",
    })
    .sort("dueDate");

  // Calculate days overdue for each rent
  const overdueRentsWithDays = overdueRents.map((rent) => {
    const dueDate = new Date(rent.dueDate);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

    // Update status to Overdue if not already set
    if (rent.status !== "Overdue") {
      Rent.findByIdAndUpdate(rent._id, { status: "Overdue" }).exec();
    }

    return {
      ...rent.toObject(),
      daysOverdue,
    };
  });

  // Also check for tenants who have completed their payment period but don't have a rent record
  const tenants = await Tenant.find({
    adminId,
    active: true,
  }).populate("roomId");

  // Array to store additional overdue rents
  const additionalOverdueRents = [];

  // Process each tenant
  for (const tenant of tenants) {
    // Skip tenants without a room or joining date
    if (!tenant.roomId || !tenant.joiningDate) {
      continue;
    }

    const joinDate = new Date(tenant.joiningDate);
    const paymentPeriod = tenant.paymentPeriod || "monthly";

    // Find the most recent rent record for this tenant
    const mostRecentRent = await Rent.findOne({
      adminId,
      tenantId: tenant._id,
    }).sort({ dueDate: -1 });

    let calculationStartDate = joinDate;
    if (mostRecentRent) {
      calculationStartDate = new Date(mostRecentRent.dueDate);
      // If the most recent rent is paid, start calculation from the next period
      if (mostRecentRent.isPaid) {
        switch (paymentPeriod) {
          case "monthly":
            calculationStartDate.setMonth(calculationStartDate.getMonth() + 1);
            break;
          case "weekly":
            calculationStartDate.setDate(calculationStartDate.getDate() + 7);
            break;
          case "daily":
            calculationStartDate.setDate(calculationStartDate.getDate() + 1);
            break;
        }
      }
    }
    calculationStartDate.setHours(0, 0, 0, 0);

    // Calculate the most recent due date that has passed
    let mostRecentDueDate = new Date(calculationStartDate);

    // If calculationStartDate is in the future, skip this tenant
    if (calculationStartDate > today) {
      continue;
    }

    // Calculate next due date based on payment period
    while (true) {
      const nextDate = new Date(mostRecentDueDate);
      switch (paymentPeriod) {
        case "monthly":
          nextDate.setMonth(mostRecentDueDate.getMonth() + 1);
          // Handle month end dates
          if (nextDate.getDate() !== mostRecentDueDate.getDate()) {
            nextDate.setDate(0);
            nextDate.setDate(mostRecentDueDate.getDate());
            if (nextDate.getMonth() !== (mostRecentDueDate.getMonth() + 1) % 12) {
              nextDate.setDate(0);
            }
          }
          break;
        case "weekly":
          nextDate.setDate(mostRecentDueDate.getDate() + 7);
          break;
        case "daily":
          nextDate.setDate(mostRecentDueDate.getDate() + 1);
          break;
      }

      if (nextDate <= today) {
        mostRecentDueDate = nextDate;
      } else {
        break;
      }
    }

    // Get period details based on payment period
    let periodDetails = {};
    switch (paymentPeriod) {
      case "monthly":
        periodDetails = {
          month: mostRecentDueDate.getMonth() + 1,
          year: mostRecentDueDate.getFullYear(),
        };
        break;
      case "weekly":
        periodDetails = {
          weekNumber: getWeekNumber(mostRecentDueDate),
          year: mostRecentDueDate.getFullYear(),
        };
        break;
      case "daily":
        periodDetails = {
          date: mostRecentDueDate.toISOString().split("T")[0],
        };
        break;
    }

    // Check if there's already a rent record for this period
    const existingRent = await Rent.findOne({
      adminId,
      tenantId: tenant._id,
      paymentPeriod,
      ...periodDetails,
    });

    // If there's no existing rent record or it's not paid, add to overdue rents
    if (!existingRent || !existingRent.isPaid) {
      // Ensure this overdue rent is not already captured
      const isAlreadyInOverdueRentsWithDays = overdueRentsWithDays.some(
        (rent) =>
          existingRent && rent._id && rent._id.toString() === existingRent._id.toString()
      );

      if (!isAlreadyInOverdueRentsWithDays) {
        // Calculate days overdue
        const daysOverdue = Math.floor(
          (today - mostRecentDueDate) / (1000 * 60 * 60 * 24)
        );

        additionalOverdueRents.push({
          _id: existingRent ? existingRent._id : null,
          tenantId: {
            _id: tenant._id,
            name: tenant.name,
            phone: tenant.phone,
            email: tenant.email,
            joiningDate: tenant.joiningDate,
            paymentPeriod: tenant.paymentPeriod,
          },
          roomId: {
            _id: tenant.roomId._id,
            floorNumber: tenant.roomId.floorNumber,
            roomNumber: tenant.roomId.roomNumber,
            rentAmount: tenant.roomId.rentAmount,
          },
          dueDate: mostRecentDueDate,
          amount: existingRent ? existingRent.amount : tenant.roomId.rentAmount,
          paymentPeriod: tenant.paymentPeriod,
          ...periodDetails,
          status: "Overdue",
          isPaid: existingRent ? existingRent.isPaid : false,
          daysOverdue: daysOverdue,
          needsRecord: !existingRent,
        });
      }
    }
  }

  // Combine both sets of overdue rents
  const allOverdueRents = [...overdueRentsWithDays, ...additionalOverdueRents];

  // Sort by days overdue (descending)
  allOverdueRents.sort((a, b) => b.daysOverdue - a.daysOverdue);

  res.status(200).json({
    success: true,
    count: allOverdueRents.length,
    data: allOverdueRents,
  });
});

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// @desc    Generate monthly rent records for all active tenants
// @route   POST /api/v1/rents/generate-monthly
// @access  Private
exports.generateMonthlyRents = asyncHandler(async (req, res, next) => {
  const adminId = req.admin.id;

  // Get the target month and year (default to next month)
  const today = new Date();
  let targetMonth = today.getMonth() + 1; // 0-indexed to 1-indexed
  let targetYear = today.getFullYear();

  // If specified in request, use those values instead
  if (req.body.month && req.body.year) {
    targetMonth = parseInt(req.body.month);
    targetYear = parseInt(req.body.year);
  } else {
    // Default to next month
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
  }

  // Get all active tenants
  const tenants = await Tenant.find({
    adminId,
    active: true,
  }).populate("roomId");

  const results = {
    created: [],
    skipped: [],
    errors: [],
  };

  // Process each tenant
  for (const tenant of tenants) {
    try {
      // Skip tenants without a room
      if (!tenant.roomId) {
        results.skipped.push({
          tenantId: tenant._id,
          name: tenant.name,
          reason: "No room assigned",
        });
        continue;
      }

      // Check if rent record already exists for this tenant, month, and year
      const existingRent = await Rent.findOne({
        tenantId: tenant._id,
        month: targetMonth,
        year: targetYear,
      });

      if (existingRent) {
        results.skipped.push({
          tenantId: tenant._id,
          name: tenant.name,
          reason: `Rent record already exists for ${targetMonth}/${targetYear}`,
        });
        continue;
      }

      // Calculate due date based on tenant's joining date
      const joiningDate = new Date(tenant.joiningDate);
      const dueDate = new Date(
        targetYear,
        targetMonth - 1,
        joiningDate.getDate()
      );

      // Create rent record
      const newRent = await Rent.create({
        tenantId: tenant._id,
        roomId: tenant.roomId._id,
        adminId,
        amount: tenant.roomId.rentAmount,
        month: targetMonth,
        year: targetYear,
        dueDate,
        status: "Pending",
        isPaid: false,
      });

      results.created.push(newRent);
    } catch (err) {
      results.errors.push({
        tenantId: tenant._id,
        name: tenant.name,
        error: err.message,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      created: results.created.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      details: results,
    },
  });
});

