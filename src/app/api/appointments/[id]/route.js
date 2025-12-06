// src/app/api/appointments/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/libs/dbConnect';
import { Appointment } from '@/models/Appointment';
import { asyncHandler, logger, AppError } from '@/utils/errorHandler';
import { requireAuth, getSessionUser, canAccessResource } from '@/utils/authHelpers';
import { ValidationSchema, validators, sanitizers } from '@/utils/validation';
import { checkRateLimit } from '@/utils/apiHelpers';
import mongoose from 'mongoose';

// Schema de validación para actualizar citas
const updateAppointmentSchema = new ValidationSchema({
  status: [
    validators.custom(
      (value) => !value || ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].includes(value),
      'Estado no válido'
    )
  ],
  notes: [
    validators.custom(
      (value) => !value || (typeof value === 'string' && value.length <= 1000),
      'Las notas no pueden exceder 1000 caracteres'
    )
  ],
  cancelReason: [
    validators.custom(
      (value) => !value || (typeof value === 'string' && value.length >= 5 && value.length <= 500),
      'La razón de cancelación debe tener entre 5 y 500 caracteres'
    )
  ]
});

export const GET = asyncHandler(async (req, { params }) => {
  const session = await requireAuth(req);
  await dbConnect();

  // Validar ID
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new AppError('ID de cita inválido', 400);
  }

  const appointment = await Appointment.findById(params.id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email phone professionalInfo');

  if (!appointment) {
    throw new AppError('Cita no encontrada', 404);
  }

  const user = await getSessionUser(session);
  
  // Verificar acceso: admin, paciente de la cita, o doctor de la cita
  const hasAccess = canAccessResource(session, appointment.patient._id, ['admin']) ||
                    appointment.patient._id.toString() === user._id.toString() ||
                    appointment.doctor._id.toString() === user._id.toString();

  if (!hasAccess) {
    logger.warn('Intento de acceso no autorizado a cita', {
      userId: user._id,
      appointmentId: params.id,
      userRole: user.role
    });
    throw new AppError('No tienes acceso a esta cita', 403);
  }

  logger.info('Cita consultada', {
    userId: user._id,
    appointmentId: params.id,
    role: user.role
  });

  return NextResponse.json({ appointment }, { status: 200 });
});

export const PATCH = asyncHandler(async (req, { params }) => {
  const session = await requireAuth(req);
  
  // Rate limiting: 10 modificaciones por hora por usuario
  const clientId = session.user.email;
  const rateLimit = checkRateLimit(`update-appointment-${clientId}`, 10, 60 * 60 * 1000);
  
  if (!rateLimit.allowed) {
    logger.warn('Rate limit excedido al actualizar cita', { email: clientId });
    return NextResponse.json(
      { 
        error: 'Demasiados intentos de actualización. Por favor, espera antes de intentar de nuevo.',
        retryAfter: Math.ceil(rateLimit.retryAfter / 1000)
      },
      { status: 429 }
    );
  }

  await dbConnect();

  // Validar ID
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new AppError('ID de cita inválido', 400);
  }

  const body = await req.json();
  
  // Sanitizar datos
  const sanitized = {
    status: body.status ? sanitizers.trim(body.status) : undefined,
    notes: body.notes ? sanitizers.escape(sanitizers.trim(body.notes)) : undefined,
    cancelReason: body.cancelReason ? sanitizers.escape(sanitizers.trim(body.cancelReason)) : undefined
  };

  // Validar datos
  updateAppointmentSchema.validate(sanitized);

  const { status, notes, cancelReason } = sanitized;

  const appointment = await Appointment.findById(params.id);

  if (!appointment) {
    throw new AppError('Cita no encontrada', 404);
  }

  const user = await getSessionUser(session);

  // Verificar permisos
  const hasAccess = canAccessResource(session, appointment.patient, ['admin']) ||
                    appointment.patient.toString() === user._id.toString() ||
                    appointment.doctor.toString() === user._id.toString();

  if (!hasAccess) {
    logger.warn('Intento de modificación no autorizada de cita', {
      userId: user._id,
      appointmentId: params.id,
      userRole: user.role
    });
    throw new AppError('No tienes permiso para modificar esta cita', 403);
  }

  // Validar transiciones de estado
  if (status && status !== appointment.status) {
    // No se puede cambiar una cita completada o cancelada (excepto admin)
    if ((appointment.status === 'completed' || appointment.status === 'cancelled') && user.role !== 'admin') {
      throw new AppError('No puedes modificar una cita completada o cancelada', 400);
    }

    // Si se cancela, debe proporcionar razón
    if (status === 'cancelled' && !cancelReason) {
      throw new AppError('Debes proporcionar una razón para cancelar la cita', 400);
    }
  }

  const oldStatus = appointment.status;

  // Actualizar campos
  if (status) {
    if (status === 'cancelled') {
      await appointment.cancel(user._id, cancelReason || 'Sin razón especificada');
    } else {
      appointment.status = status;
    }
  }

  if (notes !== undefined) {
    appointment.notes = notes;
  }

  await appointment.save();

  await appointment.populate('patient', 'name email');
  await appointment.populate('doctor', 'name email professionalInfo.specialty');

  logger.info('Cita actualizada exitosamente', {
    appointmentId: params.id,
    userId: user._id,
    changes: {
      statusChanged: oldStatus !== appointment.status,
      oldStatus,
      newStatus: appointment.status,
      notesUpdated: notes !== undefined,
      cancelReason: cancelReason || null
    }
  });

  return NextResponse.json(
    {
      success: true,
      appointment,
      message: 'Cita actualizada exitosamente'
    },
    { status: 200 }
  );
});

// DELETE - Eliminar cita (solo admin)
export const DELETE = asyncHandler(async (req, { params }) => {
  const session = await requireAuth(req);
  await dbConnect();

  // Validar ID
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    throw new AppError('ID de cita inválido', 400);
  }

  const user = await getSessionUser(session);

  // Solo admin puede eliminar
  if (user.role !== 'admin') {
    logger.warn('Intento de eliminación de cita por usuario no admin', {
      userId: user._id,
      appointmentId: params.id,
      role: user.role
    });
    throw new AppError('Solo administradores pueden eliminar citas', 403);
  }

  const appointment = await Appointment.findById(params.id);

  if (!appointment) {
    throw new AppError('Cita no encontrada', 404);
  }

  // Guardar info antes de eliminar para el log
  const appointmentInfo = {
    id: appointment._id,
    patient: appointment.patient,
    doctor: appointment.doctor,
    date: appointment.date,
    status: appointment.status
  };

  await Appointment.findByIdAndDelete(params.id);

  logger.info('Cita eliminada por administrador', {
    adminId: user._id,
    adminEmail: user.email,
    deletedAppointment: appointmentInfo
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Cita eliminada exitosamente'
    },
    { status: 200 }
  );
});
