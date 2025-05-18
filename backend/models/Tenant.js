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
    required: [true, 'Please add a phone number']
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
    required: [true, 'Please add ID proof number']
  },
  occupation: String,
  joiningDate: {
    type: Date,
    default: Date.now
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tenant', TenantSchema);
