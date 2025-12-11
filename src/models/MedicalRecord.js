import mongoose from 'mongoose';

const MedicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  consultDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: {
    type: String,
    trim: true,
    default: ''
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    trim: true,
    default: ''
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  exams: [{
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    result: String,
    notes: String,
    status: {
      type: String,
      enum: ['requested', 'completed', 'pending'],
      default: 'completed'
    }
  }],
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String
  },
  nextFollowUp: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

MedicalRecordSchema.index({ patient: 1, consultDate: -1 });
MedicalRecordSchema.index({ doctor: 1, consultDate: -1 });

export const MedicalRecord = mongoose.models?.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
