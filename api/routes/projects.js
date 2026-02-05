const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ==========================================
// PUBLIC ROUTES (No auth required)
// ==========================================

// Get all visible projects (for frontend)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ visible: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');
    
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

// Get single project by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      slug: req.params.slug,
      visible: true 
    }).select('-__v');
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error al obtener el proyecto' });
  }
});

// ==========================================
// ADMIN ROUTES (Auth required)
// ==========================================

// Get all projects (including hidden) - Admin only
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');
    
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
});

// Get single project by ID - Admin only
router.get('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('-__v');
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error al obtener el proyecto' });
  }
});

// Create new project - Admin only
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      slug,
      order,
      visible,
      title,
      description,
      image,
      links,
      demoType,
      technologies,
      hoverColor
    } = req.body;

    // Validate required fields
    if (!slug || !title?.en || !title?.es || !description?.en || !description?.es || !image) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: slug, title (en/es), description (en/es), image' 
      });
    }

    // Check if slug already exists
    const existingProject = await Project.findOne({ slug: slug.toLowerCase() });
    if (existingProject) {
      return res.status(400).json({ error: 'Ya existe un proyecto con este slug' });
    }

    const project = new Project({
      slug: slug.toLowerCase(),
      order: order || 0,
      visible: visible !== undefined ? visible : true,
      title,
      description,
      image,
      links: links || {},
      demoType: demoType || null,
      technologies: technologies || [],
      hoverColor: hoverColor || 'blue'
    });

    await project.save();
    
    res.status(201).json({ 
      message: 'Proyecto creado exitosamente',
      project 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
});

// Update project - Admin only
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      slug,
      order,
      visible,
      title,
      description,
      image,
      links,
      demoType,
      technologies,
      hoverColor
    } = req.body;

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Check if new slug conflicts with another project
    if (slug && slug.toLowerCase() !== project.slug) {
      const existingProject = await Project.findOne({ slug: slug.toLowerCase() });
      if (existingProject) {
        return res.status(400).json({ error: 'Ya existe un proyecto con este slug' });
      }
      project.slug = slug.toLowerCase();
    }

    // Update fields if provided
    if (order !== undefined) project.order = order;
    if (visible !== undefined) project.visible = visible;
    if (title) project.title = { ...project.title, ...title };
    if (description) project.description = { ...project.description, ...description };
    if (image) project.image = image;
    if (links) project.links = { ...project.links, ...links };
    if (demoType !== undefined) project.demoType = demoType;
    if (technologies) project.technologies = technologies;
    if (hoverColor) project.hoverColor = hoverColor;

    await project.save();
    
    res.json({ 
      message: 'Proyecto actualizado exitosamente',
      project 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
});

// Toggle project visibility - Admin only
router.patch('/admin/:id/visibility', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    project.visible = !project.visible;
    await project.save();
    
    res.json({ 
      message: `Proyecto ${project.visible ? 'visible' : 'oculto'}`,
      project 
    });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    res.status(500).json({ error: 'Error al cambiar visibilidad' });
  }
});

// Update projects order - Admin only
router.patch('/admin/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { projectOrders } = req.body; // Array of { id, order }
    
    if (!Array.isArray(projectOrders)) {
      return res.status(400).json({ error: 'Se requiere un array de projectOrders' });
    }

    const updatePromises = projectOrders.map(({ id, order }) => 
      Project.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);
    
    res.json({ message: 'Orden actualizado exitosamente' });
  } catch (error) {
    console.error('Error reordering projects:', error);
    res.status(500).json({ error: 'Error al reordenar proyectos' });
  }
});

// Delete project - Admin only
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({ 
      message: 'Proyecto eliminado exitosamente',
      deletedProject: project 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});

module.exports = router;
