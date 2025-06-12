const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  idProofType: {
    type: String,
    enum: ['Aadhar', 'PAN', 'Driving License', 'Passport', 'Voter ID', 'Other'],
    required: [true, 'Please specify ID proof type']
  },
  idProofNumber: {
    type: String,
    required: [true, 'Please add ID proof number'],
    unique: true
  },
  occupation: String,
  joiningDate: {
    type: Date,
    required: [true, 'Please add joining date'],
    default: Date.now
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bedNumber: {
    type: Number,
    required: [true, 'Please specify bed number']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  paymentPeriod: {
    type: String,
    enum: ["monthly", "weekly", "daily"],
    default: "monthly",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create compound index for room and bed to ensure uniqueness
TenantSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Tenant', TenantSchema);
