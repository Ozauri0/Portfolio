const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const { authenticateToken } = require('../middleware/auth');

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
    
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     '127.0.0.1';

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Register login log
    try {
      await LoginLog.create({
        userId: user._id,
        email: user.email,
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'] || 'Unknown',
        loginTime: new Date(),
        success: true
      });
      
      console.log('✅ Login registrado exitosamente para:', user.email, 'desde IP:', clientIP);
    } catch (logErr) {
      console.warn('Error en sistema de logs:', logErr);
      // Don't fail the login if logging fails
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      },
      session: {
        access_token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // With JWT, logout is handled client-side by removing the token
    // You could optionally implement a token blacklist here
    
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
      email: req.user.email
    }
  });
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new JWT token
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      session: {
        access_token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
