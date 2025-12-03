// src/utils/authHelpers.js
import { getServerSession } from 'next-auth';
import { AppError, ErrorTypes } from './errorHandler';

/**
 * Obtiene authOptions de forma din\u00e1mica
 */
export async function getAuthOptions() {
  const authModule = await import('@/app/api/auth/[...nextauth]/route');
  return authModule.authOptions || {};
}

/**
 * Middleware de autenticaci\u00f3n - verifica que el usuario est\u00e9 logueado
 */
export async function requireAuth(req) {
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new AppError('No autorizado - Sesi\u00f3n requerida', 401);
  }
  
  return session;
}

/**
 * Middleware de autorización - verifica roles
 * Retorna una función middleware que verifica si el usuario tiene uno de los roles permitidos
 */
export function requireRole(allowedRoles = []) {
  return async (req, session) => {
    if (!session) {
      session = await requireAuth(req);
    }
    
    if (!allowedRoles.includes(session.user.role)) {
      throw new AppError(
        `Acceso denegado - Se requiere uno de estos roles: ${allowedRoles.join(', ')}`,
        403
      );
    }
    
    return session;
  };
}

/**
 * Verificar si el usuario tiene permiso para acceder a un recurso
 */
export function canAccessResource(session, resourceOwnerId, allowedRoles = ['admin']) {
  // Admin siempre tiene acceso
  if (allowedRoles.includes(session.user.role)) {
    return true;
  }
  
  // El due\u00f1o del recurso tiene acceso
  if (session.user.id === resourceOwnerId?.toString()) {
    return true;
  }
  
  return false;
}

/**
 * Obtener usuario desde sesi\u00f3n con datos adicionales de la BD
 */
export async function getSessionUser(req) {
  const session = await requireAuth(req);
  
  // Importar din\u00e1micamente para evitar ciclos
  const { User } = await import('@/models/User');
  
  const user = await User.findOne({ email: session.user.email })
    .select('_id name email role phone bloodType isActive professionalInfo')
    .lean();
  
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  if (!user.isActive) {
    throw new AppError('Cuenta desactivada', 403);
  }
  
  return user;
}

/**
 * Verificar propiedad de un recurso
 */
export async function verifyResourceOwnership(session, Model, resourceId, ownerField = 'user') {
  const resource = await Model.findById(resourceId).lean();
  
  if (!resource) {
    throw new AppError('Recurso no encontrado', 404);
  }
  
  if (!canAccessResource(session, resource[ownerField])) {
    throw new AppError('No tienes permiso para acceder a este recurso', 403);
  }
  
  return resource;
}
