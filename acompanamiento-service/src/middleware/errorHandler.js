/**
 * Centralized exception handling and error normalization middleware.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Application Error]:', err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors ? err.errors.map(e => e.message) : [err.message]
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
