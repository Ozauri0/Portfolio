const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Project = require('../models/Project');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Directorio público de Next.js (sirve imágenes estáticas)
// En Docker se usa la variable de entorno PUBLIC_DIR, en local resuelve a ../../public
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, '..', '..', 'public');

// Configuración de multer: guarda en /public con nombre sanitizado
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    cb(null, PUBLIC_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .substring(0, 60);
    const unique = `${Date.now()}-${base}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes .jpg, .jpeg, .png o .webp'));
    }
  }
});

const HOVER_COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'cyan', 'indigo'];
const DEMO_TYPES = ['demo', 'download', 'documentation'];

// Helper: URL absoluta https (sin credenciales) usada para enlaces e imágenes (VUL-014)
function isHttpsUrl(url) {
  if (typeof url !== 'string' || url.length > 500) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

// Helper: URL https válida O ruta local (/imagen.webp o /public/imagen.webp) (VUL-014)
function isValidImageUrl(url) {
  if (typeof url === 'string' && /^\/(public\/)?[\w\-. +]+\.(jpg|jpeg|png|webp)$/i.test(url)) {
    return true;
  }
  return isHttpsUrl(url);
}

const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

// Valida el cuerpo de un proyecto. Devuelve un mensaje de error o null.
// partial=true (PUT) solo valida los campos presentes.
function validateProjectBody(body, { partial = false } = {}) {
  const { slug, order, visible, title, description, image, links, demoType, technologies, hoverColor } = body || {};
  const present = (v) => v !== undefined;

  if (!partial || present(slug)) {
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) || slug.length > 60 || slug.toLowerCase() === 'total') {
      return 'El slug debe ser texto (letras, números y guiones, máx. 60) y no puede ser "total"';
    }
  }
  if (!partial || present(title)) {
    if (!title || !isText(title.en, 120) || !isText(title.es, 120)) {
      return 'El título (en/es) debe ser texto de hasta 120 caracteres';
    }
  }
  if (!partial || present(description)) {
    if (!description || !isText(description.en, 2000) || !isText(description.es, 2000)) {
      return 'La descripción (en/es) debe ser texto de hasta 2000 caracteres';
    }
  }
  if (!partial || present(image)) {
    if (!isValidImageUrl(image)) {
      return 'La imagen debe ser una URL https:// válida o una ruta local de imagen';
    }
  }
  if (present(order) && !(Number.isInteger(order) && order >= -100000 && order <= 100000)) {
    return 'El orden debe ser un número entero';
  }
  if (present(visible) && typeof visible !== 'boolean') {
    return 'visible debe ser booleano';
  }
  if (present(links) && links !== null) {
    if (typeof links !== 'object' || Array.isArray(links)) return 'links debe ser un objeto';
    for (const key of ['github', 'demo', 'download']) {
      const v = links[key];
      if (v !== undefined && v !== null && v !== '' && !isHttpsUrl(v)) {
        return `El enlace "${key}" debe ser una URL https:// válida`;
      }
    }
  }
  if (present(demoType) && demoType !== null && !DEMO_TYPES.includes(demoType)) {
    return 'demoType no válido';
  }
  if (present(technologies)) {
    if (!Array.isArray(technologies) || technologies.length > 40 ||
        !technologies.every((t) => typeof t === 'string' && /^[\w.+#-]{1,40}$/.test(t))) {
      return 'technologies debe ser una lista de nombres de tecnología válidos';
    }
  }
  if (present(hoverColor) && !HOVER_COLORS.includes(hoverColor)) {
    return 'hoverColor no válido';
  }
  return null;
}

// Normaliza enlaces: cadenas vacías -> null
function cleanLinks(links) {
  const out = {};
  for (const key of ['github', 'demo', 'download']) {
    if (links && links[key] !== undefined) out[key] = links[key] || null;
  }
  return out;
}

// ==========================================
// IMAGE UPLOAD (Admin only)
// ==========================================

// Upload project image - Admin only
router.post('/admin/upload-image', authenticateToken, requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen no puede superar los 5 MB' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }
    res.json({ path: `/public/${req.file.filename}` });
  });
});

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

    // Validar tipos, formatos y enlaces (VUL-014)
    const validationError = validateProjectBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
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
      links: cleanLinks(links),
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

    const validationError = validateProjectBody(req.body, { partial: true });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

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
    if (links) project.links = { ...project.links, ...cleanLinks(links) };
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
