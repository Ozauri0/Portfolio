const mongoose = require('mongoose');

const analyticsClickSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['social', 'project'],
    required: true
  },
  target: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique type-target combinations
analyticsClickSchema.index({ type: 1, target: 1 }, { unique: true });

// Update updatedAt on save
analyticsClickSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AnalyticsClick', analyticsClickSchema);
