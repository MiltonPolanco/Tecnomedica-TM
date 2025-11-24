// models/DoctorSchedule.js
import { model, models, Schema } from "mongoose";

const TimeSlotSchema = new Schema({
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
  },
});

const DayScheduleSchema = new Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // Domingo
    max: 6, // Sábado
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  timeSlots: [TimeSlotSchema],
});

const DoctorScheduleSchema = new Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El doctor es requerido'],
    unique: true,
  },
  consultationDuration: {
    type: Number,
    default: 30, // minutos por consulta
    min: 15,
    max: 120,
  },
  weeklySchedule: [DayScheduleSchema],
  // Días específicos bloqueados (vacaciones, días festivos, etc.)
  blockedDates: [{
    date: {
      type: Date,
      required: true,
    },
    reason: String,
  }],
  // Configuración adicional
  allowBookingDaysInAdvance: {
    type: Number,
    default: 30, // Cuántos días adelante pueden agendar
  },
  minAdvanceBookingHours: {
    type: Number,
    default: 2, // Mínimo de horas de anticipación para agendar
  },
}, { 
  timestamps: true,
});

DoctorScheduleSchema.index({ 'blockedDates.date': 1 });

DoctorScheduleSchema.methods.isDayAvailable = function(dayOfWeek) {
  const daySchedule = this.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
  return daySchedule ? daySchedule.isAvailable : false;
};

DoctorScheduleSchema.methods.getAvailableTimeSlotsForDay = function(dayOfWeek) {
  const daySchedule = this.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
  if (!daySchedule || !daySchedule.isAvailable) {
    return [];
  }
  return daySchedule.timeSlots;
};

DoctorScheduleSchema.methods.isDateBlocked = function(date) {
  // Normalizar la fecha de entrada a medianoche en hora local
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return this.blockedDates.some(blocked => {
    // Normalizar la fecha bloqueada a medianoche en hora local
    const blockedDate = new Date(blocked.date);
    blockedDate.setHours(0, 0, 0, 0);
    
    return checkDate.getTime() === blockedDate.getTime();
  });
};

DoctorScheduleSchema.statics.createDefaultSchedule = async function(doctorId) {
  const defaultSchedule = {
    doctor: doctorId,
    consultationDuration: 30,
    weeklySchedule: [
      // Lunes a Viernes: 9:00 AM - 12:00 PM y 2:00 PM - 6:00 PM
      {
        dayOfWeek: 1, // Lunes
        isAvailable: true,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        dayOfWeek: 2, // Martes
        isAvailable: true,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        dayOfWeek: 3, // Miércoles
        isAvailable: true,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        dayOfWeek: 4, // Jueves
        isAvailable: true,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        dayOfWeek: 5, // Viernes
        isAvailable: true,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        dayOfWeek: 6, // Sábado
        isAvailable: true,
        timeSlots: [
          { startTime: '09:00', endTime: '13:00' },
        ],
      },
      {
        dayOfWeek: 0, // Domingo
        isAvailable: false,
        timeSlots: [],
      },
    ],
    blockedDates: [],
    allowBookingDaysInAdvance: 30,
    minAdvanceBookingHours: 2,
  };

  return this.create(defaultSchedule);
};

export const DoctorSchedule = models.DoctorSchedule || model("DoctorSchedule", DoctorScheduleSchema);
