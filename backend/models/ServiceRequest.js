const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  service: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'In progress', 'Done'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);