class BusinessError extends Error {
  constructor(message, statusCode = 409) {
    super(message);
    this.name = 'BusinessError';
    this.statusCode = statusCode;
  }
}

class NotFoundError extends Error {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ForbiddenError extends Error {
  constructor(message = 'No tienes permisos para esta acción') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

module.exports = { BusinessError, NotFoundError, ForbiddenError };
