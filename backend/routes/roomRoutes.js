const express = require("express");
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  fixRoomOccupancy,
  migrateRooms,
} = require("../controllers/roomController");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/").get(protect, getRooms).post(protect, createRoom);

router
  .route("/:id")
  .get(protect, getRoom)
  .put(protect, updateRoom)
  .delete(protect, deleteRoom);

router.route("/fix-occupancy/all").get(protect, fixRoomOccupancy);
router.route("/migrate").get(protect, migrateRooms);

module.exports = router;
