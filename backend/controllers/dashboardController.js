const Room = require("../models/Room");
const Tenant = require("../models/Tenant");
const Rent = require("../models/Rent");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get admin ID from authenticated user
  const adminId = req.admin.id;

  // Get total rooms count
  const totalRooms = await Room.countDocuments({ adminId });

  // Get rooms with at least one bed occupied
  const occupiedRooms = await Room.countDocuments({
    adminId,
    occupiedBeds: { $gt: 0 },
  });

  // Get fully occupied rooms (where occupiedBeds equals capacity)
  const fullyOccupiedRooms = await Room.countDocuments({
    adminId,
    $expr: { $eq: ["$occupiedBeds", "$capacity"] },
  });

  // Get partially occupied rooms (where occupiedBeds is greater than 0 but less than capacity)
  const partiallyOccupiedRooms = await Room.countDocuments({
    adminId,
    occupiedBeds: { $gt: 0 },
    $expr: { $lt: ["$occupiedBeds", "$capacity"] },
  });

  // Get total tenants count
  const totalTenants = await Tenant.countDocuments({ adminId });

  // Get pending rents count
  const pendingRents = await Rent.countDocuments({
    adminId,
    isPaid: false,
    // Only count rents for the current month or past months
    dueDate: { $lte: new Date() },
  });

  // Get upcoming and overdue rents
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30); // Show dues for the next 30 days

  // Get past due date (30 days ago)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Get all active tenants
  const tenants = await Tenant.find({
    adminId,
    active: true,
  }).populate("roomId");

  // Get all existing rent records for the date range
  const existingRents = await Rent.find({
    adminId,
    dueDate: {
      $gte: thirtyDaysAgo,
      $lte: thirtyDaysFromNow,
    },
  });

  // Map of tenant ID to rent record
  const tenantRentMap = {};
  existingRents.forEach((rent) => {
    const tenantId = rent.tenantId.toString();
    if (!tenantRentMap[tenantId]) {
      tenantRentMap[tenantId] = [];
    }
    tenantRentMap[tenantId].push(rent);
  });

  // Array to store upcoming due rents
  const upcomingDueRents = [];
  // Array to store overdue rents
  const overdueRents = [];

  // Process each tenant
  for (const tenant of tenants) {
    // Check if tenant has a join date
    if (tenant.joiningDate) {
      const joinDate = new Date(tenant.joiningDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set to beginning of day

      // Calculate the first due date (one month after joining)
      const firstDueDate = new Date(joinDate);
      firstDueDate.setMonth(joinDate.getMonth() + 1);
      firstDueDate.setHours(0, 0, 0, 0); // Set to beginning of day

      // Check if the tenant has completed at least one month
      const hasCompletedOneMonth = currentDate >= firstDueDate;

      // Calculate the most recent due date
      let mostRecentDueDate = new Date(joinDate);

      // Find the most recent due date that has passed
      while (true) {
        const nextDate = new Date(mostRecentDueDate);
        nextDate.setMonth(mostRecentDueDate.getMonth() + 1);

        if (nextDate <= currentDate) {
          mostRecentDueDate = nextDate;
        } else {
          break;
        }
      }

      // Calculate the next upcoming due date
      const nextDueDate = new Date(mostRecentDueDate);
      nextDueDate.setMonth(mostRecentDueDate.getMonth() + 1);

      // Check if there's already a rent record for this tenant for the calculated due date month/year
      const tenantRents = tenantRentMap[tenant._id.toString()] || [];

      // Find if there's a rent record for the next due date month/year
      const nextDueMonth = nextDueDate.getMonth() + 1; // JavaScript months are 0-indexed
      const nextDueYear = nextDueDate.getFullYear();

      const existingRentForNextDueDate = tenantRents.find(
        (rent) => rent.month === nextDueMonth && rent.year === nextDueYear
      );

      // Find if there's a rent record for the most recent due date month/year
      const mostRecentDueMonth = mostRecentDueDate.getMonth() + 1; // JavaScript months are 0-indexed
      const mostRecentDueYear = mostRecentDueDate.getFullYear();

      const existingRentForMostRecentDueDate = tenantRents.find(
        (rent) =>
          rent.month === mostRecentDueMonth && rent.year === mostRecentDueYear
      );

      // Check if tenant has completed one month and has an unpaid rent for the most recent due date
      if (
        hasCompletedOneMonth &&
        (!existingRentForMostRecentDueDate ||
          !existingRentForMostRecentDueDate.isPaid)
      ) {
        // Add to overdue rents if the most recent due date has passed
        if (mostRecentDueDate <= today) {
          // If there's no existing rent record, create a placeholder
          const overdueRent = existingRentForMostRecentDueDate || {
            tenant: {
              _id: tenant._id,
              name: tenant.name,
              phone: tenant.phone,
              joiningDate: tenant.joiningDate,
            },
            room: {
              _id: tenant.roomId._id,
              floorNumber: tenant.roomId.floorNumber,
              roomNumber: tenant.roomId.roomNumber,
              rentAmount: tenant.roomId.rentAmount,
            },
            dueDate: mostRecentDueDate,
            amount: tenant.roomId.rentAmount,
            month: mostRecentDueMonth,
            year: mostRecentDueYear,
          };

          // Calculate days past due
          const daysPastDue = Math.floor(
            (today - new Date(mostRecentDueDate)) / (1000 * 60 * 60 * 24)
          );

          // Add to overdue rents
          overdueRents.push({
            _id: existingRentForMostRecentDueDate
              ? existingRentForMostRecentDueDate._id
              : null,
            tenant: {
              _id: tenant._id,
              name: tenant.name,
              phone: tenant.phone,
              joiningDate: tenant.joiningDate,
            },
            room: {
              _id: tenant.roomId._id,
              floorNumber: tenant.roomId.floorNumber,
              roomNumber: tenant.roomId.roomNumber,
              rentAmount: tenant.roomId.rentAmount,
            },
            dueDate: mostRecentDueDate,
            amount: tenant.roomId.rentAmount,
            month: mostRecentDueMonth,
            year: mostRecentDueYear,
            daysPastDue: daysPastDue,
          });
        }
      }

      // Handle the next upcoming due date
      if (!existingRentForNextDueDate) {
        // This is an upcoming due rent that needs to be created
        if (nextDueDate <= thirtyDaysFromNow && nextDueDate >= today) {
          upcomingDueRents.push({
            tenant: {
              _id: tenant._id,
              name: tenant.name,
              phone: tenant.phone,
              joiningDate: tenant.joiningDate,
            },
            room: {
              _id: tenant.roomId._id,
              floorNumber: tenant.roomId.floorNumber,
              roomNumber: tenant.roomId.roomNumber,
              rentAmount: tenant.roomId.rentAmount,
            },
            dueDate: nextDueDate,
            amount: tenant.roomId.rentAmount,
            month: nextDueMonth,
            year: nextDueYear,
          });
        }
      } else if (!existingRentForNextDueDate.isPaid) {
        // This is an existing rent record that's not paid
        if (existingRentForNextDueDate.dueDate < today) {
          // It's overdue
          overdueRents.push({
            _id: existingRentForNextDueDate._id,
            tenant: {
              _id: tenant._id,
              name: tenant.name,
              phone: tenant.phone,
              joiningDate: tenant.joiningDate,
            },
            room: {
              _id: tenant.roomId._id,
              floorNumber: tenant.roomId.floorNumber,
              roomNumber: tenant.roomId.roomNumber,
              rentAmount: tenant.roomId.rentAmount,
            },
            dueDate: existingRentForNextDueDate.dueDate,
            amount: existingRentForNextDueDate.amount,
            month: existingRentForNextDueDate.month,
            year: existingRentForNextDueDate.year,
            daysPastDue: Math.floor(
              (today - new Date(existingRentForNextDueDate.dueDate)) /
                (1000 * 60 * 60 * 24)
            ),
          });
        } else {
          // It's upcoming but already created
          upcomingDueRents.push({
            _id: existingRentForNextDueDate._id,
            tenant: {
              _id: tenant._id,
              name: tenant.name,
              phone: tenant.phone,
              joiningDate: tenant.joiningDate,
            },
            room: {
              _id: tenant.roomId._id,
              floorNumber: tenant.roomId.floorNumber,
              roomNumber: tenant.roomId.roomNumber,
              rentAmount: tenant.roomId.rentAmount,
            },
            dueDate: existingRentForNextDueDate.dueDate,
            amount: existingRentForNextDueDate.amount,
            month: existingRentForNextDueDate.month,
            year: existingRentForNextDueDate.year,
            existingRecord: true,
          });
        }
      }

      // Also check for any other unpaid rents for this tenant
      tenantRents.forEach((rent) => {
        if (
          !rent.isPaid &&
          (rent.month !== dueMonth || rent.year !== dueYear) && // Not the one we just processed
          rent.dueDate < today
        ) {
          // It's in the past

          // Add to overdue rents if not already included
          if (
            !overdueRents.some(
              (overdue) => overdue._id.toString() === rent._id.toString()
            )
          ) {
            overdueRents.push({
              _id: rent._id,
              tenant: {
                _id: tenant._id,
                name: tenant.name,
                phone: tenant.phone,
                joiningDate: tenant.joiningDate,
              },
              room: {
                _id: tenant.roomId._id,
                floorNumber: tenant.roomId.floorNumber,
                roomNumber: tenant.roomId.roomNumber,
                rentAmount: tenant.roomId.rentAmount,
              },
              dueDate: rent.dueDate,
              amount: rent.amount,
              month: rent.month,
              year: rent.year,
              daysPastDue: Math.floor(
                (today - new Date(rent.dueDate)) / (1000 * 60 * 60 * 24)
              ),
            });
          }
        }
      });
    }
  }

  // Sort upcoming due rents by due date (ascending)
  upcomingDueRents.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Sort overdue rents by days past due (descending)
  overdueRents.sort((a, b) => b.daysPastDue - a.daysPastDue);

  res.status(200).json({
    success: true,
    data: {
      totalRooms,
      occupiedRooms,
      fullyOccupiedRooms,
      partiallyOccupiedRooms,
      totalTenants,
      pendingRents,
      upcomingDueRents,
      overdueRents,
    },
  });
});
