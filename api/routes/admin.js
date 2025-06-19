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

// Logs de conexiones del usuario (reemplaza el placeholder anterior)
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get login logs for the authenticated user
    const { data: logs, error } = await supabaseAdmin
      .from('login_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('login_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error obteniendo logs:', error);
      return res.status(500).json({
        error: 'Error obteniendo logs de conexión'
      });
    }

    // Format the logs for better display
    const formattedLogs = logs.map(log => ({
      id: log.id,
      loginTime: log.login_time,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      success: log.success,
      location: log.location || 'Desconocida',
      // Format date for display
      formattedDate: new Date(log.login_time).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Mexico_City'
      })
    }));

    res.json({
      logs: formattedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length,
        hasMore: logs.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error en endpoint de logs:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
