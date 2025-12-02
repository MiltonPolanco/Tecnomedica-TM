// src/utils/apiHelpers.js

/**
 * Wrapper para manejar errores en API routes de manera consistente
 */
export async function handleApiError(error, customMessage = 'Error en el servidor') {
  console.error('API Error:', error);
  
  const response = {
    error: customMessage,
    message: error.message || 'Ocurrió un error inesperado',
  };

  // En desarrollo, incluir más detalles
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Valida que los campos requeridos estén presentes en el body
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }
  
  return true;
}

/**
 * Valida formato de email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza entrada de usuario para prevenir inyecciones
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y > para prevenir XSS básico
    .slice(0, 1000); // Limitar longitud
}

/**
 * Rate limiter simple basado en IP
 * Para producción, usar Redis o similar
 */
const requestCounts = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  // Resetear si pasó la ventana de tiempo
  if (now > userRequests.resetTime) {
    userRequests.count = 0;
    userRequests.resetTime = now + windowMs;
  }
  
  userRequests.count++;
  requestCounts.set(identifier, userRequests);
  
  if (userRequests.count > maxRequests) {
    const retryAfter = Math.ceil((userRequests.resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfter
    };
  }
  
  return {
    allowed: true,
    remaining: maxRequests - userRequests.count
  };
}

/**
 * Limpiar rate limiter periódicamente (llamar en un cron job o interval)
 */
export function cleanupRateLimiter() {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}
