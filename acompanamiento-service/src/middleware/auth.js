const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to validate JWT tokens and extract authenticated user context.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Acceso no autorizado',
      message: 'Token de autenticación no proporcionado en la cabecera Authorization.'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });

    // Support standard claims and claims issued by ASP.NET Core identity
    req.user = {
      id: decoded.sub || decoded.nameid,
      email: decoded.email,
      name: decoded.name || decoded.unique_name,
      role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      documentNumber: decoded.documentNumber
    };

    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Token inválido o expirado',
      message: err.message
    });
  }
};

/**
 * Role-Based Access Control (RBAC) authorization middleware.
 * @param {...string} allowedRoles - List of permitted roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permiso denegado',
        message: `El rol '${req.user.role}' no cuenta con permisos suficientes para esta operación.`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
