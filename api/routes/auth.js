const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const { authenticateToken } = require('../middleware/auth');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} = require('../utils/tokenManager');

// Helper function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

// Helper function to set refresh token cookie
function setRefreshTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', token, {
    httpOnly: true, // No accessible via JavaScript (prevents XSS)
    secure: isProduction, // Only HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth' // Only send cookie to auth routes
  });
}

// User registration - DISABLED for exclusive personal use
router.post('/register', async (req, res) => {
  return res.status(403).json({
    error: 'Registro deshabilitado - Acceso restringido'
  });
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Register failed login attempt
      try {
        await LoginLog.create({
          email: email,
          ipAddress: clientIP,
          userAgent: userAgent,
          loginTime: new Date(),
          success: false
        });
      } catch (logErr) {
        console.warn('Error logging failed attempt:', logErr);
      }

      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Register failed login attempt
      try {
        await LoginLog.create({
          userId: user._id,
          email: user.email,
          ipAddress: clientIP,
          userAgent: userAgent,
          loginTime: new Date(),
          success: false
        });
      } catch (logErr) {
        console.warn('Error logging failed attempt:', logErr);
      }

      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, clientIP, userAgent);

    // Set refresh token in HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Register successful login
    try {
      await LoginLog.create({
        userId: user._id,
        email: user.email,
        ipAddress: clientIP,
        userAgent: userAgent,
        loginTime: new Date(),
        success: true
      });
      
      console.log('✅ Login exitoso:', user.email, 'desde IP:', clientIP);
    } catch (logErr) {
      console.warn('Error en sistema de logs:', logErr);
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      accessToken,
      expiresIn: '15m'
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'No se encontró token de actualización',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Verify and get user (also extends token expiration)
    const user = await verifyRefreshToken(refreshToken, clientIP, userAgent);

    if (!user) {
      // Token invalid or revoked
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth'
      });

      return res.status(401).json({
        error: 'Token de actualización inválido o expirado',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      expiresIn: '15m',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Logout (revoke current refresh token)
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth'
    });

    res.json({
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Logout from all devices (revoke all user's refresh tokens)
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    await revokeAllUserTokens(userId);

    // Clear current refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth'
    });

    res.json({
      message: 'Sesión cerrada en todos los dispositivos'
    });

  } catch (error) {
    console.error('Error en logout-all:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Get authenticated user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        createdAt: req.user.createdAt
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Check if user is authenticated
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    message: 'Token válido',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
