const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido' 
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(403).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expirado' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Token inválido' 
    });
  }
};

// Middleware to verify if user is administrator
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    console.log('Verificando admin para usuario ID:', req.user._id);
    console.log('Rol del usuario:', req.user.role);

    if (req.user.role !== 'admin') {
      console.log('Usuario no es admin. Rol actual:', req.user.role);
      return res.status(403).json({ 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    console.log('✅ Usuario verificado como admin');
    next();
  } catch (error) {
    console.error('Error verificando permisos de admin:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};
