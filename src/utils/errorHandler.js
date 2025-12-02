// src/utils/errorHandler.js

/**
 * Clase personalizada para errores de la aplicaci\u00f3n
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores comunes predefinidos
 */
export const ErrorTypes = {
  UNAUTHORIZED: new AppError('No autorizado', 401),
  FORBIDDEN: new AppError('Acceso denegado', 403),
  NOT_FOUND: new AppError('Recurso no encontrado', 404),
  VALIDATION_ERROR: new AppError('Error de validaci\u00f3n', 400),
  CONFLICT: new AppError('Conflicto en la operaci\u00f3n', 409),
  INTERNAL_ERROR: new AppError('Error interno del servidor', 500),
};

/**
 * Manejador global de errores para API routes
 */
export function handleError(error) {
  // Log del error
  console.error('[Error Handler]', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Determinar si es un error operacional o de programaci\u00f3n
  const isOperational = error.isOperational || false;
  
  // En producci\u00f3n, no exponer detalles de errores no operacionales
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    error: true,
    message: isOperational || isDevelopment 
      ? error.message 
      : 'Error interno del servidor',
    statusCode: error.statusCode || 500,
  };

  // Solo incluir stack trace en desarrollo
  if (isDevelopment) {
    response.stack = error.stack;
    response.type = error.constructor.name;
  }

  return response;
}

/**
 * Wrapper para async handlers en API routes
 * Captura errores autom\u00e1ticamente
 */
export function asyncHandler(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      const errorResponse = handleError(error);
      return Response.json(errorResponse, { 
        status: errorResponse.statusCode 
      });
    }
  };
}

/**
 * Validar y lanzar error si falla
 */
export function validateOrThrow(condition, error) {
  if (!condition) {
    throw error;
  }
}

/**
 * Logger estructurado
 */
export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  },
  
  error: (message, error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        message: error.message,
        stack: error.stack,
      },
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  },
  
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  },
};
