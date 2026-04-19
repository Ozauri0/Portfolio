const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
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

// Rate limiter estricto solo para login (VUL-001)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos de login. Intenta en 15 minutos.' }
});

// Helper function to get client IP (VUL-002)
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const firstIP = forwarded.split(',')[0].trim();
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(firstIP)) return firstIP;
  }
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
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

// User login (VUL-001 rate limit + VUL-012 validación)
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false, gmail_convert_googlemail: false }).withMessage('Email no válido'),
  body('password').isLength({ min: 1, max: 72 }).withMessage('Contraseña inválida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos de entrada inválidos' });
  }

  try {
    const { email, password } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

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

    // VUL-001: Verificar bloqueo de cuenta
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        error: 'Cuenta bloqueada temporalmente. Intenta nuevamente más tarde.',
        code: 'ACCOUNT_LOCKED'
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

      // Incrementar intentos fallidos y bloquear si supera límite (VUL-001)
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();

      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Resetear intentos fallidos en login exitoso (VUL-001)
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

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

    // Verify and rotate refresh token (VUL-003)
    const { user, newRefreshToken } = await verifyRefreshToken(refreshToken, clientIP, userAgent);

    // Set the rotated refresh token in cookie
    setRefreshTokenCookie(res, newRefreshToken);

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
    // Limpiar cookie si el token es inválido o expirado
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth'
    });
    console.error('Error en refresh token:', error.message);
    return res.status(401).json({
      error: 'Token de actualización inválido o expirado',
      code: 'INVALID_REFRESH_TOKEN'
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
