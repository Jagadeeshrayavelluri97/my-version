const Rent = require("../models/Rent");
const Tenant = require("../models/Tenant");
const Room = require("../models/Room");
const mongoose = require("mongoose");

/**
 * Update rent statuses - mark as overdue if past due date
 */
const updateRentStatuses = async () => {
  try {
    console.log("Running scheduled rent status update...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all unpaid rents with due dates in the past
    const overdueRents = await Rent.find({
      isPaid: false,
      dueDate: { $lt: today },
      status: { $ne: "Overdue" },
    });

    console.log(`Found ${overdueRents.length} overdue rents to update`);

    // Update status to Overdue
    for (const rent of overdueRents) {
      await Rent.findByIdAndUpdate(rent._id, { status: "Overdue" });
    }

    console.log("Rent status update completed successfully");
  } catch (err) {
    console.error("Error updating rent statuses:", err);
  }
};

/**
 * Generate rent records for the next month for all active tenants
 */
const generateMonthlyRents = async () => {
  try {
    console.log("Running scheduled monthly rent generation...");

    // Get the target month and year (next month)
    const today = new Date();
    let targetMonth = today.getMonth() + 1; // 0-indexed to 1-indexed
    let targetYear = today.getFullYear();

    // Default to next month
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }

    console.log(`Generating rent records for ${targetMonth}/${targetYear}`);

    // Get all admins
    const admins = await require("../models/Admin").find({});

    let totalCreated = 0;

    // Process each admin
    for (const admin of admins) {
      // Get all active tenants for this admin
      const tenants = await Tenant.find({
        adminId: admin._id,
        active: true,
      }).populate("roomId");

      console.log(
        `Processing ${tenants.length} tenants for admin ${admin._id}`
      );

      // Process each tenant
      for (const tenant of tenants) {
        try {
          // Skip tenants without a room
          if (!tenant.roomId) {
            continue;
          }

          // Check if rent record already exists for this tenant, month, and year
          const existingRent = await Rent.findOne({
            tenantId: tenant._id,
            month: targetMonth,
            year: targetYear,
          });

          if (existingRent) {
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
          await Rent.create({
            tenantId: tenant._id,
            roomId: tenant.roomId._id,
            adminId: admin._id,
            amount: tenant.roomId.rentAmount,
            month: targetMonth,
            year: targetYear,
            dueDate,
            status: "Pending",
            isPaid: false,
          });

          totalCreated++;
        } catch (err) {
          console.error(`Error creating rent for tenant ${tenant._id}:`, err);
        }
      }
    }

    console.log(
      `Monthly rent generation completed. Created ${totalCreated} new rent records.`
    );
  } catch (err) {
    console.error("Error generating monthly rents:", err);
  }
};

/**
 * Check for missing rent records for tenants who have paid their previous month's rent
 * This ensures that after a tenant pays their first month, subsequent months are properly tracked
 */
const checkForMissingRentRecords = async () => {
  try {
    console.log("Running check for missing rent records...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all admins
    const admins = await require("../models/Admin").find({});

    let totalCreated = 0;

    // Process each admin
    for (const admin of admins) {
      // Get all active tenants for this admin
      const tenants = await Tenant.find({
        adminId: admin._id,
        active: true,
      }).populate("roomId");

      console.log(
        `Processing ${tenants.length} tenants for admin ${admin._id} for missing rent records`
      );

      // Process each tenant
      for (const tenant of tenants) {
        try {
          // Skip tenants without a room or joining date
          if (!tenant.roomId || !tenant.joiningDate) {
            continue;
          }

          const joinDate = new Date(tenant.joiningDate);

          // Find the most recent paid rent for this tenant
          const mostRecentPaidRent = await Rent.findOne({
            tenantId: tenant._id,
            isPaid: true,
          }).sort({ dueDate: -1 }); // Sort by due date descending to get the most recent

          if (mostRecentPaidRent) {
            // Calculate the next due date after the most recent paid rent
            const lastDueDate = new Date(mostRecentPaidRent.dueDate);
            const nextDueDate = new Date(lastDueDate);
            nextDueDate.setMonth(lastDueDate.getMonth() + 1);

            // Keep the same day of month as the joining date
            nextDueDate.setDate(joinDate.getDate());

            // Get the month and year for the next due date
            const nextMonth = nextDueDate.getMonth() + 1; // Convert from 0-indexed to 1-indexed
            const nextYear = nextDueDate.getFullYear();

            // Check if this due date is in the past (should already have a record)
            if (nextDueDate <= today) {
              // Check if a rent record already exists for this due date
              const existingRent = await Rent.findOne({
                tenantId: tenant._id,
                month: nextMonth,
                year: nextYear,
              });

              // If no record exists for this due date, create one
              if (!existingRent) {
                console.log(
                  `Creating missing rent record for tenant ${tenant.name} for ${nextMonth}/${nextYear}`
                );

                await Rent.create({
                  tenantId: tenant._id,
                  roomId: tenant.roomId._id,
                  adminId: admin._id,
                  amount: tenant.roomId.rentAmount,
                  month: nextMonth,
                  year: nextYear,
                  dueDate: nextDueDate,
                  status: "Overdue", // Since the due date is in the past
                  isPaid: false,
                });

                totalCreated++;
              }
            }
          }
        } catch (err) {
          console.error(
            `Error checking for missing rent records for tenant ${tenant._id}:`,
            err
          );
        }
      }
    }

    console.log(
      `Missing rent record check completed. Created ${totalCreated} new rent records.`
    );
  } catch (err) {
    console.error("Error checking for missing rent records:", err);
  }
};

module.exports = {
  updateRentStatuses,
  generateMonthlyRents,
  checkForMissingRentRecords,
};
