// src/constants/roles.js

/**
 * Roles disponibles en la aplicación
 */
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

/**
 * Permisos por rol
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.PATIENT]: [
    'view_calendar',
    'book_appointment',
    'view_own_appointments',
    'contact_support',
  ],
  [USER_ROLES.DOCTOR]: [
    'view_calendar',
    'view_all_appointments',
    'manage_appointments',
    'view_patient_info',
    'contact_support',
  ],
  [USER_ROLES.ADMIN]: [
    'view_calendar',
    'view_all_appointments',
    'manage_appointments',
    'view_patient_info',
    'view_doctor_info',
    'manage_users',
    'view_analytics',
    'contact_support',
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
