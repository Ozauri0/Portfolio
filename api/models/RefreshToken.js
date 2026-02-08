const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// TTL index to auto-delete expired tokens after 7 days
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 });

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.revoked && this.expiresAt > new Date();
};

// Method to extend expiration
refreshTokenSchema.methods.extendExpiration = function(days = 30) {
  this.expiresAt = new Date();
  this.expiresAt.setDate(this.expiresAt.getDate() + days);
  this.lastUsedAt = new Date();
  return this.save();
};

// Method to revoke token
refreshTokenSchema.methods.revoke = function() {
  this.revoked = true;
  this.revokedAt = new Date();
  return this.save();
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function(userId) {
  return this.updateMany(
    { userId, revoked: false },
    { revoked: true, revokedAt: new Date() }
  );
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revoked: true, revokedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ]
  });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
