// src/constants/appointments.js

/**
 * Tipos de citas médicas
 */
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  EMERGENCY: 'emergency',
  VACCINATION: 'vaccination',
  EXAM: 'exam',
};

export const APPOINTMENT_TYPE_LABELS = {
  [APPOINTMENT_TYPES.CONSULTATION]: 'Consulta General',
  [APPOINTMENT_TYPES.FOLLOW_UP]: 'Seguimiento',
  [APPOINTMENT_TYPES.EMERGENCY]: 'Urgencia',
  [APPOINTMENT_TYPES.VACCINATION]: 'Vacunación',
  [APPOINTMENT_TYPES.EXAM]: 'Examen Médico',
};

/**
 * Estados de citas
 */
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Agendada',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmada',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'En Progreso',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completada',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelada',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Asistió',
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [APPOINTMENT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-orange-100 text-orange-800',
};

/**
 * Especialidades médicas
 */
export const SPECIALTIES = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Pediatría',
  'Ginecología',
  'Psicología',
  'Nutrición',
  'Oftalmología',
  'Traumatología',
  'Neurología',
  'Endocrinología',
  'Urología',
];

/**
 * Horarios disponibles (24h format)
 */
export const AVAILABLE_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00'
];

/**
 * Duración predeterminada de consultas (en minutos)
 */
export const DEFAULT_APPOINTMENT_DURATION = 30;
