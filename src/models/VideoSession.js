import mongoose from 'mongoose';

const videoSessionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // en minutos
    default: 0
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas
videoSessionSchema.index({ appointment: 1 });
videoSessionSchema.index({ status: 1 });

export const VideoSession = mongoose.models.VideoSession || mongoose.model('VideoSession', videoSessionSchema);
