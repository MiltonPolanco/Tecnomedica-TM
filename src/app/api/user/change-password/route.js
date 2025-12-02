import mongoose from 'mongoose';
import '@/models/User';
import bcrypt from 'bcrypt';
import { asyncHandler, AppError, logger } from '@/utils/errorHandler';
import { requireAuth } from '@/utils/authHelpers';
import { ValidationSchema, validators } from '@/utils/validation';
import { checkRateLimit } from '@/utils/apiHelpers';
import dbConnect from '@/libs/dbConnect';

const User = mongoose.models.User || mongoose.model('User');

// Schema de validación para cambio de contraseña
const changePasswordSchema = new ValidationSchema({
  currentPassword: [validators.required('La contraseña actual es requerida')],
  newPassword: [
    validators.required('La nueva contraseña es requerida'),
    validators.minLength(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    validators.custom(
      (value) => /[A-Z]/.test(value),
      'Debe contener al menos una letra mayúscula'
    ),
    validators.custom(
      (value) => /[0-9]/.test(value),
      'Debe contener al menos un número'
    ),
  ],
  confirmPassword: [
    validators.required('La confirmación de contraseña es requerida'),
    validators.custom(
      (value, data) => value === data.newPassword,
      'Las contraseñas no coinciden'
    ),
  ],
});

// POST - Cambiar contraseña
export const POST = asyncHandler(async (req) => {
  // 1. Autenticación requerida
  const session = await requireAuth(req);

  // 2. Rate Limiting - Prevenir ataques de fuerza bruta
  const rateLimit = checkRateLimit(`change-password-${session.user.id}`, 5, 900000); // 5 intentos cada 15 min
  
  if (!rateLimit.allowed) {
    logger.warn('Rate limit excedido en cambio de contraseña', { 
      userId: session.user.id 
    });
    throw new AppError(
      `Demasiados intentos. Intenta de nuevo en ${rateLimit.retryAfter} segundos`,
      429
    );
  }

  // 3. Obtener y validar datos
  const body = await req.json();
  changePasswordSchema.validate(body);

  const { currentPassword, newPassword } = body;

  // 4. Validación adicional: nueva contraseña diferente a la actual
  if (currentPassword === newPassword) {
    throw new AppError('La nueva contraseña debe ser diferente a la actual', 400);
  }

  // 5. Conectar a BD
  await dbConnect();

  // 6. Buscar usuario con contraseña
  const user = await User.findOne({ email: session.user.email }).select('+password');

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // 7. Verificar si el usuario tiene contraseña (no OAuth)
  if (!user.password) {
    throw new AppError(
      'Tu cuenta usa autenticación de Google. No puedes cambiar la contraseña.',
      400
    );
  }

  // 8. Verificar contraseña actual
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  
  if (!isValidPassword) {
    logger.warn('Intento de cambio de contraseña con contraseña incorrecta', {
      userId: user._id,
      email: user.email,
    });
    throw new AppError('Contraseña actual incorrecta', 400);
  }

  // 9. Actualizar contraseña (el hook pre-save se encarga del hash)
  user.password = newPassword;
  await user.save();

  // 10. Log del evento exitoso
  logger.info('Contraseña actualizada exitosamente', {
    userId: user._id,
    email: user.email,
  });

  // 11. Respuesta exitosa
  return Response.json({ 
    success: true,
    message: 'Contraseña actualizada exitosamente' 
  }, { status: 200 });
});
