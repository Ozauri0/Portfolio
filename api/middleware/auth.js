const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../config/supabase');

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
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ 
        error: 'Token inválido o expirado' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
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
    
    // Check if user has admin role
    // Use supabaseAdmin for administrative queries
    console.log('Verificando admin para usuario ID:', req.user.id);
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    console.log('Perfil encontrado:', profile);
    console.log('Error:', error);

    if (error) {
      console.log('Error obteniendo perfil:', error.message);
      return res.status(403).json({ 
        error: 'Error verificando permisos de usuario' 
      });
    }

    if (!profile || profile.role !== 'admin') {
      console.log('Usuario no es admin. Rol actual:', profile?.role);
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
