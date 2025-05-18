const express = require("express");
const {
  getRents,
  getRent,
  createRent,
  updateRent,
  deleteRent,
  createAutoRents,
  markRentAsPaid,
  getUpcomingRents,
  getOverdueRents,
  generateMonthlyRents,
} = require("../controllers/rentController");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/").get(protect, getRents).post(protect, createRent);

router.route("/create-auto").post(protect, createAutoRents);

router.route("/upcoming").get(protect, getUpcomingRents);

router.route("/overdue").get(protect, getOverdueRents);

router.route("/generate-monthly").post(protect, generateMonthlyRents);

router
  .route("/:id")
  .get(protect, getRent)
  .put(protect, updateRent)
  .delete(protect, deleteRent);

router.route("/:id/pay").put(protect, markRentAsPaid);

module.exports = router;
