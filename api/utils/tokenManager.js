const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

// Token durations
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days

/**
 * Generate Access Token (short-lived)
 */
function generateAccessToken(user) {
  return jwt.sign(
    { 
      userId: user._id || user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate Refresh Token (long-lived)
 */
async function generateRefreshToken(user, ipAddress, userAgent) {
  // Create a secure random token
  const token = crypto.randomBytes(64).toString('hex');
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  
  // Save to database
  const refreshToken = new RefreshToken({
    token,
    userId: user._id || user.id,
    expiresAt,
    ipAddress,
    userAgent
  });
  
  await refreshToken.save();
  
  return token;
}

/**
 * Verify and decode Access Token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw { name: 'TokenExpiredError', message: 'Access token expired' };
    }
    throw { name: 'JsonWebTokenError', message: 'Invalid access token' };
  }
}

/**
 * Verify Refresh Token and return the user
 */
async function verifyRefreshToken(token) {
  const User = require('../models/User');
  
  const refreshToken = await RefreshToken.findOne({ 
    token,
    revoked: false
  });
  
  if (!refreshToken) {
    throw new Error('Invalid refresh token');
  }
  
  if (refreshToken.expiresAt < new Date()) {
    throw new Error('Refresh token expired');
  }
  
  // Get the user from database
  const user = await User.findById(refreshToken.userId).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update last used timestamp and extend expiration
  refreshToken.lastUsedAt = new Date();
  refreshToken.expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await refreshToken.save();
  
  console.log('✅ Refresh token válido para usuario:', user.email);
  
  return user;
}

/**
 * Revoke Refresh Token
 */
async function revokeRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (refreshToken) {
    refreshToken.revoked = true;
    refreshToken.revokedAt = new Date();
    await refreshToken.save();
  }
}

/**
 * Revoke all tokens for a user
 */
async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany(
    { userId, revoked: false },
    { 
      revoked: true, 
      revokedAt: new Date() 
    }
  );
}

/**
 * Clean up expired tokens (can be run as a cron job)
 */
async function cleanupExpiredTokens() {
  const result = await RefreshToken.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS
};
