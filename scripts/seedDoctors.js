// scripts/seedDoctors.js
// Script para crear doctores de prueba
// Ejecutar con: node scripts/seedDoctors.js

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URL = process.env.MONGO_URL;

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean,
  professionalInfo: {
    specialty: String,
    licenseNumber: String,
    yearsOfExperience: Number,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const doctors = [
  {
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@tecnomedica.com',
    password: 'doctor123',
    role: 'doctor',
    isActive: true,
    professionalInfo: {
      specialty: 'Medicina General',
      licenseNumber: 'MG-12345',
      yearsOfExperience: 10,
    },
  },
  {
    name: 'Dra. María González',
    email: 'maria.gonzalez@tecnomedica.com',
    password: 'doctor123',
    role: 'doctor',
    isActive: true,
    professionalInfo: {
      specialty: 'Cardiología',
      licenseNumber: 'CARD-54321',
      yearsOfExperience: 15,
    },
  },
  {
    name: 'Dr. Carlos Rodríguez',
    email: 'carlos.rodriguez@tecnomedica.com',
    password: 'doctor123',
    role: 'doctor',
    isActive: true,
    professionalInfo: {
      specialty: 'Pediatría',
      licenseNumber: 'PED-98765',
      yearsOfExperience: 8,
    },
  },
  {
    name: 'Dra. Ana Martínez',
    email: 'ana.martinez@tecnomedica.com',
    password: 'doctor123',
    role: 'doctor',
    isActive: true,
    professionalInfo: {
      specialty: 'Psicología',
      licenseNumber: 'PSI-11223',
      yearsOfExperience: 12,
    },
  },
  {
    name: 'Dr. Luis Hernández',
    email: 'luis.hernandez@tecnomedica.com',
    password: 'doctor123',
    role: 'doctor',
    isActive: true,
    professionalInfo: {
      specialty: 'Dermatología',
      licenseNumber: 'DERM-44556',
      yearsOfExperience: 7,
    },
  },
];

async function seedDoctors() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Conectado a MongoDB');

    console.log('👨‍⚕️ Creando doctores de prueba...');

    for (const doctorData of doctors) {
      // Verificar si el doctor ya existe
      const existingDoctor = await User.findOne({ email: doctorData.email });
      
      if (existingDoctor) {
        console.log(`⚠️  Doctor ${doctorData.name} ya existe, saltando...`);
        continue;
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doctorData.password, salt);

      // Crear doctor
      await User.create({
        ...doctorData,
        password: hashedPassword,
      });

      console.log(`✅ Creado: ${doctorData.name} (${doctorData.professionalInfo.specialty})`);
    }

    console.log('\n🎉 ¡Doctores creados exitosamente!');
    console.log('\n📋 Credenciales para login:');
    console.log('Email: cualquiera de los emails arriba');
    console.log('Contraseña: doctor123');
    
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDoctors();
