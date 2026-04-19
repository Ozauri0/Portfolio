const mongoose = require('mongoose');

const uniqueVisitorSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  firstVisit: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  visitCount: {
    type: Number,
    default: 1
  }
});

// Index for faster queries
uniqueVisitorSchema.index({ ipAddress: 1 });
uniqueVisitorSchema.index({ lastVisit: -1 });

module.exports = mongoose.model('UniqueVisitor', uniqueVisitorSchema);
