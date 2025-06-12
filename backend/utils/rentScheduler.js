const cron = require("node-cron");
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

    // Update status to Overdue for unpaid rents with due date in the past
    await Rent.updateMany(
      {
        dueDate: { $lt: today },
        isPaid: false,
        status: { $ne: "Overdue" },
      },
      {
        $set: { status: "Overdue" },
      }
    );

    console.log("Rent statuses updated successfully");
  } catch (error) {
    console.error("Error updating rent statuses:", error);
  }
};

/**
 * Generate rent records for the next month for all active tenants
 */
const generateRentRecords = async () => {
  try {
    console.log("Running scheduled monthly rent generation...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active tenants
    const tenants = await Tenant.find({ active: true }).populate("roomId");

    for (const tenant of tenants) {
      if (!tenant.roomId) continue;

      const paymentPeriod = tenant.paymentPeriod || "monthly";
      const joinDate = new Date(tenant.joiningDate);

      // Find the most recent rent record
      const mostRecentRent = await Rent.findOne({
        tenantId: tenant._id,
      }).sort({ dueDate: -1 });

      let nextDueDate;
      if (mostRecentRent) {
        nextDueDate = new Date(mostRecentRent.dueDate);
        // If the most recent rent is paid, calculate next due date
        if (mostRecentRent.isPaid) {
          switch (paymentPeriod) {
            case "monthly":
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
            case "weekly":
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case "daily":
              nextDueDate.setDate(nextDueDate.getDate() + 1);
              break;
          }
        } else {
          // If the most recent rent is not paid, don't create a new record
          continue;
        }
      } else {
        // For new tenants, set first due date based on payment period
        nextDueDate = new Date(joinDate);
        switch (paymentPeriod) {
          case "monthly":
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
          case "weekly":
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
          case "daily":
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
        }
      }

      // Only create new rent record if next due date is today or in the future
      if (nextDueDate >= today) {
        // Get period details based on payment period
        let periodDetails = {};
        switch (paymentPeriod) {
          case "monthly":
            periodDetails = {
              month: nextDueDate.getMonth() + 1,
              year: nextDueDate.getFullYear(),
            };
            break;
          case "weekly":
            periodDetails = {
              weekNumber: getWeekNumber(nextDueDate),
              year: nextDueDate.getFullYear(),
            };
            break;
          case "daily":
            periodDetails = {
              date: nextDueDate.toISOString().split("T")[0],
            };
            break;
        }

        // Check if rent record already exists for this period
        const existingRent = await Rent.findOne({
          tenantId: tenant._id,
          paymentPeriod,
          ...periodDetails,
        });

        if (!existingRent) {
          await Rent.create({
            adminId: tenant.adminId,
            tenantId: tenant._id,
            roomId: tenant.roomId._id,
            amount: tenant.roomId.rentAmount,
            dueDate: nextDueDate,
            paymentPeriod,
            ...periodDetails,
            status: "Pending",
            isPaid: false,
          });
        }
      }
    }

    console.log("Rent records generated successfully");
  } catch (error) {
    console.error("Error generating rent records:", error);
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
          const paymentPeriod = tenant.paymentPeriod || "monthly";

          // Find the most recent paid rent for this tenant
          const mostRecentPaidRent = await Rent.findOne({
            tenantId: tenant._id,
            isPaid: true,
          }).sort({ dueDate: -1 }); // Sort by due date descending to get the most recent

          if (mostRecentPaidRent) {
            // Calculate the next due date after the most recent paid rent
            const lastDueDate = new Date(mostRecentPaidRent.dueDate);
            const nextDueDate = new Date(lastDueDate);

            switch (paymentPeriod) {
              case "monthly":
                nextDueDate.setMonth(lastDueDate.getMonth() + 1);
                if (nextDueDate.getMonth() !== (lastDueDate.getMonth() + 1) % 12) {
                  nextDueDate.setDate(0);
                }
                break;
              case "weekly":
                nextDueDate.setDate(lastDueDate.getDate() + 7);
                break;
              case "daily":
                nextDueDate.setDate(lastDueDate.getDate() + 1);
                break;
            }

            // Get period details based on payment period
            let periodDetails = {};
            switch (paymentPeriod) {
              case "monthly":
                periodDetails = {
                  month: nextDueDate.getMonth() + 1,
                  year: nextDueDate.getFullYear(),
                };
                break;
              case "weekly":
                periodDetails = {
                  weekNumber: getWeekNumber(nextDueDate),
                  year: nextDueDate.getFullYear(),
                };
                break;
              case "daily":
                periodDetails = {
                  date: nextDueDate.toISOString().split("T")[0],
                };
                break;
            }

            // Check if this due date is in the past (should already have a record)
            if (nextDueDate <= today) {
              // Check if a rent record already exists for this due date
              const existingRent = await Rent.findOne({
                tenantId: tenant._id,
                paymentPeriod,
                ...periodDetails,
              });

              // If no record exists for this due date, create one
              if (!existingRent) {
                console.log(
                  `Creating missing rent record for tenant ${tenant.name} for ${paymentPeriod} period`
                );

                await Rent.create({
                  tenantId: tenant._id,
                  roomId: tenant.roomId._id,
                  adminId: admin._id,
                  amount: tenant.roomId.rentAmount,
                  dueDate: nextDueDate,
                  paymentPeriod,
                  ...periodDetails,
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
  } catch (error) {
    console.error("Error in checkForMissingRentRecords:", error);
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Schedule rent status updates to run daily at midnight
cron.schedule("0 0 * * *", () => {
  updateRentStatuses();
});

// Schedule rent record generation to run daily at midnight
cron.schedule("0 0 * * *", () => {
  generateRentRecords();
});

// Schedule missing rent record check to run daily at 1 AM
cron.schedule("0 1 * * *", () => {
  checkForMissingRentRecords();
});

module.exports = {
  updateRentStatuses,
  generateRentRecords,
  checkForMissingRentRecords,
};
