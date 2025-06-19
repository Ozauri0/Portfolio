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

    // Get user profile data from profiles table
    console.log('Buscando perfil para usuario ID:', data.user.id);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', data.user.id)
      .single();

    console.log('Perfil encontrado:', profile);
    console.log('Error de perfil:', profileError);

    // Register login log
    try {
      const { error: logError } = await supabaseAdmin
        .from('login_logs')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          ip_address: clientIP,
          user_agent: req.headers['user-agent'] || 'Unknown',
          login_time: new Date().toISOString(),
          success: true
        });
      
      if (logError) {
        console.warn('Error registrando log de login:', logError);
        // No fails the login if logging fails
      } else {
        console.log('✅ Login registrado exitosamente para:', data.user.email, 'desde IP:', clientIP);
      }
    } catch (logErr) {
      console.warn('Error en sistema de logs:', logErr);
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name || null
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
    // Get user profile data from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', req.user.id)
      .single();

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: profile?.full_name || null,
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
