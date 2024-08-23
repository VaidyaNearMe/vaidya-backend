const mongoose = require("mongoose");

const updateRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updateData: {
    avatar: String,
    name: String,
    phone: Number,
    email: String,
    experience: String,
    gender: String,
    address: String,
    city: String,
    qualification: String,
    speciality: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialities'
    }],
    university: String,
    hospital: String,
    website: String
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
  }
});

module.exports = mongoose.model("UpdateRequest", updateRequestSchema);