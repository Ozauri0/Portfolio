const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware for all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Administrator dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic statistics
    const stats = {
      totalUsers: 0,
      recentLogins: 0,
      systemStatus: 'operational',
      socialClicks: {
        github: 0,
        linkedin: 0,
        email: 0,
        total: 0
      },
      projectClicks: {
        learnpro: 0,
        mybudget: 0,
        educaplus: 0,
        total: 0
      }
    };

    // Count total users
    const { count: userCount, error: userError } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    if (!userError) {
      stats.totalUsers = userCount || 0;
    }    // Get social media clicks
    const { data: socialClicks, error: socialError } = await supabaseAdmin
      .from('analytics_clicks')
      .select('*')
      .in('type', ['social']);

    if (!socialError && socialClicks) {
      socialClicks.forEach(click => {
        if (click.target === 'github') stats.socialClicks.github += click.count || 0;
        if (click.target === 'linkedin') stats.socialClicks.linkedin += click.count || 0;
        if (click.target === 'email') stats.socialClicks.email += click.count || 0;
      });
      stats.socialClicks.total = stats.socialClicks.github + stats.socialClicks.linkedin + stats.socialClicks.email;
    }

    // Get project clicks
    const { data: projectClicks, error: projectError } = await supabaseAdmin
      .from('analytics_clicks')
      .select('*')
      .in('type', ['project']);

    if (!projectError && projectClicks) {
      projectClicks.forEach(click => {
        if (click.target === 'learnpro') stats.projectClicks.learnpro += click.count || 0;
        if (click.target === 'mybudget') stats.projectClicks.mybudget += click.count || 0;
        if (click.target === 'educaplus') stats.projectClicks.educaplus += click.count || 0;
      });
      stats.projectClicks.total = stats.projectClicks.learnpro + stats.projectClicks.mybudget + stats.projectClicks.educaplus;
    }

    res.json({
      message: 'Bienvenido al panel de administración',
      stats,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Error en dashboard admin:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// List all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;    
    // This query might need adjustment according to your Supabase configuration
    const { data: users, error } = await supabase
      .from('profiles') // Asumiendo que tienes una tabla profiles
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      users: users || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users?.length || 0
      }
    });

  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({
      error: 'Error obteniendo lista de usuarios'
    });
  }
});

// System configuration
router.get('/settings', (req, res) => {
  res.json({
    settings: {
      siteName: 'Portfolio Admin',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.SUPABASE_URL
    }
  });
});

// Logs del sistema (placeholder)
router.get('/logs', (req, res) => {
  res.json({
    logs: [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Sistema iniciado correctamente',
        user: req.user.email
      }
    ]
  });
});

module.exports = router;
