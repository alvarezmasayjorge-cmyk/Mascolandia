const { ZodError } = require('zod');

function errorHandler(err, req, res, _next) {
  if (err.name === 'BusinessError' || err.name === 'NotFoundError' || err.name === 'ForbiddenError') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: (err.issues || err.errors || []).map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
    });
  }

  console.error('Error no manejado:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
}

module.exports = errorHandler;
