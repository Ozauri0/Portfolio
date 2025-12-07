const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: 'Unknown'
  }
});

// Index for faster queries
loginLogSchema.index({ userId: 1, loginTime: -1 });
loginLogSchema.index({ loginTime: -1 });

module.exports = mongoose.model('LoginLog', loginLogSchema);
