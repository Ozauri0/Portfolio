const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// Track click on social media or project links
router.post('/track-click', async (req, res) => {
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

    // Validate targets
    const validSocialTargets = ['github', 'linkedin', 'email'];
    const validProjectTargets = ['learnpro', 'mybudget', 'educaplus'];
    
    if (type === 'social' && !validSocialTargets.includes(target)) {
      return res.status(400).json({
        error: 'Objetivo social no válido'
      });
    }

    if (type === 'project' && !validProjectTargets.includes(target)) {
      return res.status(400).json({
        error: 'Objetivo de proyecto no válido'
      });
    }    // Check if record exists
    const { data: existingRecord, error: selectError } = await supabaseAdmin
      .from('analytics_clicks')
      .select('*')
      .eq('type', type)
      .eq('target', target)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new records
      throw selectError;
    }

    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('analytics_clicks')
        .update({ 
          count: existingRecord.count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabaseAdmin
        .from('analytics_clicks')
        .insert({
          type,
          target,
          count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }
    }

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

// Get analytics data (public endpoint for basic stats)
router.get('/stats', async (req, res) => {
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
    const { data: allClicks, error } = await supabaseAdmin
      .from('analytics_clicks')
      .select('*');

    if (!error && allClicks) {
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
    }

    res.json(stats);

  } catch (error) {
    console.error('Error getting analytics stats:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
