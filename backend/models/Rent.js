const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  // Store tenant information in case tenant is deleted
  tenantInfo: {
    name: String,
    phone: String,
    email: String,
  },
  // Store room information in case room is deleted
  roomInfo: {
    floorNumber: Number,
    roomNumber: Number,
    rentAmount: Number,
  },
  // Flag to indicate if the tenant has been deleted
  tenantDeleted: {
    type: Boolean,
    default: false,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Please add rent amount"],
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  month: {
    type: Number,
    required: [true, "Please add month (1-12)"],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, "Please add year"],
  },
  paymentDate: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"],
  },
  paymentReference: {
    type: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Partially Paid", "Paid", "Overdue"],
    default: "Pending",
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentHistory: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      },
      method: String,
      reference: String,
      notes: String,
    },
  ],
  reminderSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to ensure a tenant doesn't have duplicate rent entries for the same month/year
RentSchema.index({ tenantId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Rent", RentSchema);
