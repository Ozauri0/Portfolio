const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
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
    const { email, password } = req.body;    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name
      },
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at
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
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

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
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.user_metadata?.full_name,
        createdAt: req.user.created_at
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
      id: req.user.id,
      email: req.user.email
    }
  });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token requerido'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        error: 'Refresh token inválido'
      });
    }

    res.json({
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at,
        refresh_token: data.session.refresh_token
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
