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
    };    // Count total unique visitors
    const { count: uniqueVisitorCount, error: visitorError } = await supabaseAdmin
      .from('unique_visitors')
      .select('*', { count: 'exact', head: true });

    if (!visitorError) {
      stats.totalUsers = uniqueVisitorCount || 0;
    }

    // Count recent logins (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { count: recentLoginCount, error: loginError } = await supabaseAdmin
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .gte('login_time', oneDayAgo.toISOString())
      .eq('success', true);

    if (!loginError) {
      stats.recentLogins = recentLoginCount || 0;
    }// Get social media clicks
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

// Login logs endpoint
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get ALL login logs (not just for authenticated user) since this is admin panel
    const { data: logs, error } = await supabaseAdmin
      .from('login_logs')
      .select('*')
      .order('login_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error obteniendo logs:', error);
      return res.status(500).json({
        error: 'Error obteniendo logs de conexión'
      });
    }

    // Format the logs for better display with correct timezone
    const formattedLogs = logs.map(log => {
      const loginDate = new Date(log.login_time);
      
      return {
        id: log.id,
        loginTime: log.login_time,
        ipAddress: log.ip_address,
        userAgent: log.user_agent || 'Desconocido',
        email: log.email,
        success: log.success,
        location: log.location || 'Desconocida',
        // Format date correctly - using UTC and adjusting for Chile timezone
        formattedDate: loginDate.toLocaleString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'America/Santiago',
        })
      };
    });

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

// Get visitor statistics
router.get('/visitor-stats', async (req, res) => {
  try {
    // Get total unique visitors
    const { count: totalVisitors, error: visitorError } = await supabaseAdmin
      .from('unique_visitors')
      .select('*', { count: 'exact', head: true });

    if (visitorError) {
      console.error('Error getting visitor count:', visitorError);
    }

    // Get visitors from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { count: recentVisitors, error: recentError } = await supabaseAdmin
      .from('unique_visitors')
      .select('*', { count: 'exact', head: true })
      .gte('last_visit', oneDayAgo.toISOString());

    if (recentError) {
      console.error('Error getting recent visitors:', recentError);
    }

    // Get visitors from last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: weeklyVisitors, error: weeklyError } = await supabaseAdmin
      .from('unique_visitors')
      .select('*', { count: 'exact', head: true })
      .gte('last_visit', oneWeekAgo.toISOString());

    if (weeklyError) {
      console.error('Error getting weekly visitors:', weeklyError);
    }

    res.json({
      success: true,
      stats: {
        totalVisitors: totalVisitors || 0,
        recentVisitors: recentVisitors || 0,
        weeklyVisitors: weeklyVisitors || 0
      }
    });

  } catch (error) {
    console.error('Error getting visitor stats:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Añadir estos endpoints para el reinicio de estadísticas

// Endpoint para reiniciar estadísticas de redes sociales
router.post('/reset-social', async (req, res) => {
  try {
    // Reiniciar estadísticas de clicks en redes sociales
    const { error } = await supabaseAdmin
      .from('analytics_clicks')
      .update({ 
        count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('type', 'social');

    if (error) {
      console.error('Error reiniciando clicks sociales:', error);
      return res.status(500).json({
        error: 'Error reiniciando estadísticas'
      });
    }

    res.json({
      message: 'Estadísticas de redes sociales reiniciadas correctamente'
    });

  } catch (error) {
    console.error('Error en endpoint reset-social:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint para reiniciar estadísticas de proyectos
router.post('/reset-projects', async (req, res) => {
  try {
    // Reiniciar estadísticas de clicks en proyectos
    const { error } = await supabaseAdmin
      .from('analytics_clicks')
      .update({ 
        count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('type', 'project');

    if (error) {
      console.error('Error reiniciando clicks de proyectos:', error);
      return res.status(500).json({
        error: 'Error reiniciando estadísticas'
      });
    }

    res.json({
      message: 'Estadísticas de proyectos reiniciadas correctamente'
    });

  } catch (error) {
    console.error('Error en endpoint reset-projects:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
