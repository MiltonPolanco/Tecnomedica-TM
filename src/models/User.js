// models/User.js
import bcrypt from "bcrypt";
import { model, models, Schema } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido'],
    index: true, // Ya no es necesario declararlo después
  },
  password: {
    type: String,
    required: function() {
      // Password solo es requerido si no hay provider (OAuth)
      return !this.image;
    },
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    select: false, // No incluir password en queries por defecto
  },
  image: String, // Para OAuth providers
  role: {
    type: String,
    enum: {
      values: ["patient", "doctor", "admin"],
      message: '{VALUE} no es un rol válido'
    },
    default: "patient",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  // Información médica (para pacientes)
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    chronicConditions: [String],
  },
  // Información profesional (para doctores)
  professionalInfo: {
    specialty: String,
    licenseNumber: String,
    yearsOfExperience: Number,
  },
}, { 
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Índice adicional para mejorar rendimiento en queries por rol
UserSchema.index({ role: 1 });

// Encriptar la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  // Solo hashear si la contraseña fue modificada o es nueva
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Método para obtener información pública del usuario
UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    image: this.image,
    createdAt: this.createdAt,
  };
};

export const User = models.User || model("User", UserSchema);
