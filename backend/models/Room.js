const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  floorNumber: {
    type: Number,
    required: [true, "Please add a floor number"],
  },
  roomNumber: {
    type: String,
    required: [true, "Please add a room number"],
    trim: true,
  },
  type: {
    type: String,
    enum: ['PG', 'Dormitory'],
    required: [true, "Please select accommodation type"],
  },
  capacity: {
    type: Number,
    required: [true, "Please add room capacity"],
    default: 1,
  },
  rentAmount: {
    type: Number,
    required: [true, "Please add rent amount"],
  },
  // For Dormitory: rent per day, for PG: rent per month
  rentType: {
    type: String,
    enum: ['per_day', 'per_month'],
    required: [true, "Please specify rent type"],
  },
  occupiedBeds: {
    type: Number,
    default: 0,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  amenities: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    trim: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index on adminId, floorNumber, and roomNumber to ensure uniqueness
RoomSchema.index(
  { adminId: 1, floorNumber: 1, roomNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Room", RoomSchema);
