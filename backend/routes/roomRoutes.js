const express = require("express");
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  fixRoomOccupancy,
} = require("../controllers/roomController");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/fix-occupancy/all").get(protect, fixRoomOccupancy);


router.route("/").get(protect, getRooms).post(protect, createRoom);


router
  .route("/:id")
  .get(protect, getRoom)
  .put(protect, updateRoom)
  .delete(protect, deleteRoom);


module.exports = router;
