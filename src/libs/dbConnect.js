// src/libs/dbConnect.js
import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error('Por favor define la variable MONGO_URL en tu archivo .env');
}

/**
 * Global cache para la conexión de mongoose en desarrollo
 * Esto previene múltiples conexiones durante HMR (Hot Module Replacement)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Si ya existe una conexión, retornarla
  if (cached.conn) {
    return cached.conn;
  }

  // Si no existe una promesa de conexión, crearla
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Conexión a MongoDB establecida');
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error al conectar con MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
