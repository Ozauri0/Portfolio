const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const UniqueVisitor = require('../models/UniqueVisitor');
const AnalyticsClick = require('../models/AnalyticsClick');
const Project = require('../models/Project');
const DailyVisit = require('../models/DailyVisit');
const { SITE_TIMEZONE, lastDates } = require('../utils/siteTime');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { audit } = require('../utils/audit');

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
      // Clics por slug de cada proyecto existente (dinámico) + total
      projectClicks: {
        total: 0
      }
    };    // Count total unique visitors
    const uniqueVisitorCount = await UniqueVisitor.countDocuments();
    stats.totalUsers = uniqueVisitorCount;

    // Count recent logins (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentLoginCount = await LoginLog.countDocuments({
      loginTime: { $gte: oneDayAgo },
      success: true
    });
    stats.recentLogins = recentLoginCount;

    // Get social media clicks
    const socialClicks = await AnalyticsClick.find({ type: 'social' });

    socialClicks.forEach(click => {
      if (click.target === 'github') stats.socialClicks.github += click.count || 0;
      if (click.target === 'linkedin') stats.socialClicks.linkedin += click.count || 0;
      if (click.target === 'email') stats.socialClicks.email += click.count || 0;
    });
    stats.socialClicks.total = stats.socialClicks.github + stats.socialClicks.linkedin + stats.socialClicks.email;

    // Get project clicks: una entrada por proyecto existente (incluso con 0 clics);
    // los contadores de proyectos eliminados se ignoran
    const projects = await Project.find().sort({ order: 1, createdAt: -1 }).select('slug');
    const projectClicks = await AnalyticsClick.find({ type: 'project' });
    const clicksBySlug = new Map(projectClicks.map(click => [click.target, click.count || 0]));

    const projectStats = { total: 0 };
    projects.forEach(project => {
      const count = clicksBySlug.get(project.slug) || 0;
      projectStats[project.slug] = count;
      projectStats.total += count;
    });
    stats.projectClicks = projectStats;

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
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // VUL-016 máximo 100
    const skip = (parsedPage - 1) * parsedLimit;
    
    const users = await User.find()
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const total = await User.countDocuments();

    res.json({
      users: users || [],
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: total
      }
    });

  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({
      error: 'Error obteniendo lista de usuarios'
    });
  }
});

// System configuration (VUL-004 - sin variables de entorno sensibles)
router.get('/settings', (req, res) => {
  res.json({
    settings: {
      siteName: 'Portfolio Admin',
      version: '1.0.0',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    }
  });
});

// Login logs endpoint
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20)); // VUL-016
    const skip = (parsedPage - 1) * parsedLimit;

    // Get ALL login logs (not just for authenticated user) since this is admin panel
    const [logs, total] = await Promise.all([
      LoginLog.find()
        .sort({ loginTime: -1 })
        .skip(skip)
        .limit(parsedLimit),
      LoginLog.countDocuments()
    ]);

    // Format the logs for better display with correct timezone
    const formattedLogs = logs.map(log => {
      const loginDate = new Date(log.loginTime);
      
      return {
        id: log._id,
        loginTime: log.loginTime,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent || 'Desconocido',
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
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        hasMore: skip + logs.length < total
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
    const totalVisitors = await UniqueVisitor.countDocuments();

    // Get visitors from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentVisitors = await UniqueVisitor.countDocuments({
      lastVisit: { $gte: oneDayAgo }
    });

    // Get visitors from last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyVisitors = await UniqueVisitor.countDocuments({
      lastVisit: { $gte: oneWeekAgo }
    });

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

// Obtener datos detallados de visitas para el gráfico.
// Días y horas se calculan siempre en SITE_TIMEZONE; los datos vienen del histórico diario (DailyVisit).
const CHART_RANGE_DAYS = { day: 1, week: 7, month: 30, year: 365 };

router.get('/visitor-chart', async (req, res) => {
  try {
    const timeRange = CHART_RANGE_DAYS[req.query.timeRange] ? req.query.timeRange : 'week';
    const dates = lastDates(CHART_RANGE_DAYS[timeRange]);

    const records = await DailyVisit.find({ date: { $in: dates } }).lean();
    const byDate = new Map(records.map(r => [r.date, r]));

    const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0 }));
    let totalInPeriod = 0;
    const daily = dates.map(date => {
      const record = byDate.get(date);
      const visits = record?.visits || 0;
      totalInPeriod += visits;
      Object.entries(record?.hours || {}).forEach(([hour, count]) => {
        if (hourly[hour]) hourly[hour].visits += count;
      });
      return { date, visits };
    });

    res.json({
      success: true,
      data: { daily, hourly, totalInPeriod },
      timeRange,
      timezone: SITE_TIMEZONE
    });
  } catch (error) {
    console.error('Error obteniendo datos para el gráfico:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// Añadir estos endpoints para el reinicio de estadísticas

// Endpoint para reiniciar estadísticas de redes sociales
router.post('/reset-social', async (req, res) => {
  try {
    // Reiniciar estadísticas de clicks en redes sociales
    const result = await AnalyticsClick.updateMany(
      { type: 'social' },
      { 
        count: 0,
        updatedAt: new Date()
      }
    );
    await audit(req, 'reset-social-stats', { modified: result.modifiedCount });

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
    const result = await AnalyticsClick.updateMany(
      { type: 'project' },
      { 
        count: 0,
        updatedAt: new Date()
      }
    );
    await audit(req, 'reset-project-stats', { modified: result.modifiedCount });

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
