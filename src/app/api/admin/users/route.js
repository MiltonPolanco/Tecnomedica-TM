import dbConnect from '@/libs/dbConnect';
import { User } from '@/models/User';
import { asyncHandler, logger } from '@/utils/errorHandler';
import { requireAuth, requireRole } from '@/utils/authHelpers';
import { ValidationSchema, validators, sanitizers } from '@/utils/validation';
import { NextResponse } from 'next/server';

// Schema de validación para actualizar usuarios
const updateUserSchema = new ValidationSchema({
  userId: [
    validators.required('El ID del usuario es requerido'),
    validators.custom((value) => {
      const mongoose = require('mongoose');
      return mongoose.Types.ObjectId.isValid(value);
    }, 'ID de usuario inválido')
  ],
  role: [
    validators.custom(
      (value) => !value || ['patient', 'doctor', 'admin'].includes(value),
      'Rol no válido. Debe ser: patient, doctor o admin'
    )
  ],
  specialty: [
    validators.custom(
      (value) => !value || (typeof value === 'string' && value.length >= 3),
      'La especialidad debe tener al menos 3 caracteres'
    )
  ],
  isActive: [
    validators.custom(
      (value) => value === undefined || typeof value === 'boolean',
      'isActive debe ser un valor booleano'
    )
  ]
});

export const GET = asyncHandler(async (req) => {
  const session = await requireAuth(req);
  await requireRole(['admin'])(req, session); // 👈 Solo admins
  
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search');

  let query = {};
  
  if (role && ['patient', 'doctor', 'admin'].includes(role)) {
    query.role = role;
  }

  if (search) {
    const sanitizedSearch = sanitizers.trim(search);
    query.$or = [
      { name: { $regex: sanitizedSearch, $options: 'i' } },
      { email: { $regex: sanitizedSearch, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('name email role phone bloodType isActive createdAt professionalInfo')
    .sort({ createdAt: -1 })
    .lean();

  logger.info('Lista de usuarios obtenida', {
    adminEmail: session.user.email,
    totalUsers: users.length,
    filters: { role, search: !!search }
  });

  return NextResponse.json({ users }, { status: 200 });
});

export const PUT = asyncHandler(async (req) => {
  const session = await requireAuth(req);
  await requireRole(['admin'])(req, session); // 👈 Solo admins
  
  await dbConnect();

  const body = await req.json();
  
  // Sanitizar datos
  const sanitized = {
    userId: sanitizers.trim(body.userId),
    role: body.role ? sanitizers.trim(body.role) : undefined,
    specialty: body.specialty ? sanitizers.escape(sanitizers.trim(body.specialty)) : undefined,
    isActive: body.isActive
  };

  // Validar datos
  updateUserSchema.validate(sanitized);

  const { userId, role, specialty, isActive } = sanitized;

  const user = await User.findById(userId);
  if (!user) {
    logger.warn('Intento de actualizar usuario inexistente', {
      adminEmail: session.user.email,
      userId
    });
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const oldRole = user.role;

  // Actualizar rol
  if (role && role !== user.role) {
    user.role = role;
  }

  // Si se cambia a doctor y se proporciona especialidad
  if (role === 'doctor' && specialty) {
    if (!user.professionalInfo) {
      user.professionalInfo = {};
    }
    user.professionalInfo.specialty = specialty;
  }

  // Actualizar estado activo/inactivo
  if (typeof isActive === 'boolean' && isActive !== user.isActive) {
    user.isActive = isActive;
  }

  await user.save();

  const updatedUser = await User.findById(userId)
    .select('name email role phone bloodType isActive createdAt professionalInfo')
    .lean();

  logger.info('Usuario actualizado por admin', {
    adminEmail: session.user.email,
    userId,
    userEmail: user.email,
    changes: {
      roleChanged: oldRole !== user.role,
      oldRole,
      newRole: user.role,
      isActiveChanged: isActive !== undefined,
      specialtyUpdated: !!specialty
    }
  });

  return NextResponse.json({ 
    message: 'Usuario actualizado exitosamente',
    user: updatedUser 
  }, { status: 200 });
});
