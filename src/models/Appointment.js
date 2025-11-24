// models/Appointment.js
import { model, models, Schema } from "mongoose";

const AppointmentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El paciente es requerido'],
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El doctor es requerido'],
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida'],
  },
  startTime: {
    type: String,
    required: [true, 'La hora de inicio es requerida'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
  },
  endTime: {
    type: String,
    required: [true, 'La hora de fin es requerida'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
  },
  type: {
    type: String,
    enum: {
      values: ['consultation', 'follow-up', 'emergency', 'vaccination', 'exam'],
      message: '{VALUE} no es un tipo válido de cita'
    },
    default: 'consultation',
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'scheduled',
  },
  specialty: {
    type: String,
    required: [true, 'La especialidad es requerida'],
  },
  reason: {
    type: String,
    required: [true, 'El motivo de la consulta es requerido'],
    maxlength: [500, 'El motivo no puede exceder 500 caracteres'],
  },
  notes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres'],
  },
  meetingLink: {
    type: String,
  },
  cancelReason: {
    type: String,
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: {
    type: Date,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos para búsquedas eficientes
AppointmentSchema.index({ patient: 1, date: -1, status: 1 });
AppointmentSchema.index({ doctor: 1, date: -1, status: 1 });
AppointmentSchema.index({ date: 1, startTime: 1, status: 1 });
AppointmentSchema.index({ status: 1, date: -1 });

AppointmentSchema.virtual('durationMinutes').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
});

AppointmentSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      next(new Error('La hora de fin debe ser posterior a la hora de inicio'));
    }
  }
  next();
});

AppointmentSchema.statics.checkConflict = async function(doctorId, date, startTime, endTime, excludeId = null) {
  const query = {
    doctor: doctorId,
    date: date,
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflict = await this.findOne(query);
  return !!conflict;
};

AppointmentSchema.methods.cancel = function(userId, reason) {
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  return this.save();
};

export const Appointment = models.Appointment || model("Appointment", AppointmentSchema);
