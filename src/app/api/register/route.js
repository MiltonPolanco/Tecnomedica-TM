// /app/api/register/route.js
import { User } from "@/models/User";
import dbConnect from "@/libs/dbConnect";
import { NextResponse } from "next/server";
import { asyncHandler, AppError, logger } from "@/utils/errorHandler";
import { ValidationSchema, validators, sanitizeData } from "@/utils/validation";
import { checkRateLimit } from "@/utils/apiHelpers";

// Schema de validación para registro
const registerSchema = new ValidationSchema({
  email: [
    validators.required('El email es requerido'),
    validators.email('Email inválido')
  ],
  password: [
    validators.required('La contraseña es requerida'),
    validators.minLength(6, 'La contraseña debe tener al menos 6 caracteres')
  ],
  name: [validators.minLength(2, 'El nombre debe tener al menos 2 caracteres')],
});

export const POST = asyncHandler(async (req) => {
  // 1. Rate Limiting - Prevenir registro masivo
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`register-${ip}`, 3, 300000); // 3 registros cada 5 minutos
  
  if (!rateLimit.allowed) {
    logger.warn('Rate limit excedido en registro', { ip });
    throw new AppError(
      `Demasiados intentos de registro. Intenta de nuevo en ${rateLimit.retryAfter} segundos`,
      429
    );
  }

  // 2. Obtener y sanitizar datos
  const body = await req.json();
  const sanitizedData = sanitizeData(body, {
    email: ['trim', 'lowercase'],
    name: ['trim'],
  });

  // 3. Validar datos
  registerSchema.validate(sanitizedData);

  // 4. Conectar a la base de datos
  await dbConnect();

  // 5. Verificar si ya existe un usuario con el mismo email
  const existingUser = await User.findOne({ email: sanitizedData.email });
  if (existingUser) {
    throw new AppError("Este email ya está registrado", 400);
  }

  // 6. Crear usuario
  const createdUser = await User.create({
    email: sanitizedData.email,
    password: sanitizedData.password,
    name: sanitizedData.name || '',
    role: sanitizedData.role === 'doctor' ? 'patient' : (sanitizedData.role || 'patient'), // Prevenir auto-asignación de doctor
  });

  // 7. Log del evento
  logger.info('Usuario registrado exitosamente', {
    userId: createdUser._id,
    email: createdUser.email,
    role: createdUser.role,
  });

  // 8. Respuesta exitosa
  return NextResponse.json(
    { 
      success: true,
      message: "Usuario creado exitosamente",
      user: createdUser.toPublicJSON()
    },
    { status: 201 }
  );
});
