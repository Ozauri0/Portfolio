const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const AnalyticsClick = require('../models/AnalyticsClick');
const UniqueVisitor = require('../models/UniqueVisitor');
const Project = require('../models/Project');
const DailyVisit = require('../models/DailyVisit');
const { siteParts } = require('../utils/siteTime');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Helper: anonimizar IP con HMAC (VUL-013 - privacidad GDPR)
function anonymizeIP(ip) {
  return crypto.createHmac('sha256', process.env.IP_HASH_SALT).update(ip).digest('hex');
}

// Límites propios y más estrictos que el global para los endpoints públicos de tracking
const clickLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta más tarde.' }
});

const visitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta más tarde.' }
});

// Track click on social media or project links
router.post('/track-click', clickLimiter, async (req, res) => {
  try {
    const { type, target } = req.body;

    // Validate input
    if (!type || !target) {
      return res.status(400).json({
        error: 'Tipo y objetivo son requeridos'
      });
    }

    // Validate type
    if (!['social', 'project'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo debe ser "social" o "project"'
      });
    }

    // Validate targets (target debe ser texto: evita inyección de operadores en la consulta)
    if (typeof target !== 'string') {
      return res.status(400).json({ error: 'Objetivo no válido' });
    }
    const validSocialTargets = ['github', 'linkedin', 'email'];
    
    if (type === 'social' && !validSocialTargets.includes(target)) {
      return res.status(400).json({
        error: 'Objetivo social no válido'
      });
    }

    // Los proyectos son dinámicos: el objetivo debe ser el slug de un proyecto existente
    if (type === 'project' && !(await Project.exists({ slug: target.toLowerCase() }))) {
      return res.status(400).json({
        error: 'Objetivo de proyecto no válido'
      });
    }    // Incremento atómico (sin condición de carrera entre findOne y save)
    await AnalyticsClick.findOneAndUpdate(
      { type, target: type === 'project' ? target.toLowerCase() : target },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Click tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Get analytics data (solo admin: las estadísticas ya no son públicas)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = {
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
    };    // Get all analytics data
    const allClicks = await AnalyticsClick.find();

    allClicks.forEach(click => {
      if (click.type === 'social') {
        if (click.target === 'github') stats.socialClicks.github = click.count || 0;
        if (click.target === 'linkedin') stats.socialClicks.linkedin = click.count || 0;
        if (click.target === 'email') stats.socialClicks.email = click.count || 0;
      }
      
      if (click.type === 'project') {
        if (click.target === 'learnpro') stats.projectClicks.learnpro = click.count || 0;
        if (click.target === 'mybudget') stats.projectClicks.mybudget = click.count || 0;
        if (click.target === 'educaplus') stats.projectClicks.educaplus = click.count || 0;
      }
    });

    stats.socialClicks.total = stats.socialClicks.github + stats.socialClicks.linkedin + stats.socialClicks.email;
    stats.projectClicks.total = stats.projectClicks.learnpro + stats.projectClicks.mybudget + stats.projectClicks.educaplus;

    res.json(stats);

  } catch (error) {
    console.error('Error getting analytics stats:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Track unique visitor by IP address
router.post('/track-visitor', visitorLimiter, async (req, res) => {
  try {
    // Get IP address from request
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0]) ||
                     'unknown';

    // Clean IP address (remove ::ffff: prefix if present)
    const cleanIp = ipAddress.replace(/^::ffff:/, '');

    // Anonimizar IP antes de guardar (VUL-013)
    const hashedIp = anonymizeIP(cleanIp);

    // Get user agent for additional context
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Upsert atómico: crea el visitante o actualiza su última visita.
    // Se obtiene el documento previo para saber si ya había sido contado hoy.
    const now = new Date();
    const previous = await UniqueVisitor.findOneAndUpdate(
      { ipAddress: hashedIp },
      {
        $set: { lastVisit: now, userAgent: userAgent.slice(0, 300) },
        $inc: { visitCount: 1 },
        $setOnInsert: { firstVisit: now }
      },
      { upsert: true, new: false }
    );
    const visitor = { visitCount: (previous?.visitCount || 0) + 1 };

    // Histórico: un visitante único cuenta una vez por día (zona horaria del sitio)
    const today = siteParts(now);
    if (!previous || siteParts(previous.lastVisit).date !== today.date) {
      await DailyVisit.updateOne(
        { date: today.date },
        { $inc: { visits: 1, [`hours.${today.hour}`]: 1 } },
        { upsert: true }
      );
    }

    const isNewVisitor = visitor.visitCount === 1;
    res.json({
      success: true,
      message: isNewVisitor ? 'New unique visitor tracked' : 'Existing visitor updated',
      isNewVisitor,
      ...(isNewVisitor ? {} : { visitCount: visitor.visitCount })
    });

  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
