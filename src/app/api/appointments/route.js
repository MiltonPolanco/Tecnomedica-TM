import { NextResponse } from 'next/server';
import dbConnect from '@/libs/dbConnect';
import { Appointment } from '@/models/Appointment';
import { User } from '@/models/User';
import { VideoSession } from '@/models/VideoSession';
import '@/models/DoctorSchedule';
import mongoose from 'mongoose';
import { asyncHandler, logger } from '@/utils/errorHandler';
import { requireAuth, getSessionUser } from '@/utils/authHelpers';
import { ValidationSchema, validators, sanitizers } from '@/utils/validation';
import { checkRateLimit } from '@/utils/apiHelpers';

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule');

export const GET = asyncHandler(async (req) => {
  const session = await requireAuth(req);
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const user = await getSessionUser(session);

  // Construir query según el rol
  let query = {};
  if (user.role === 'patient') {
    query.patient = user._id;
  } else if (user.role === 'doctor') {
    query.doctor = user._id;
  } else if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Rol no válido' }, { status: 403 });
  }

  // Filtros adicionales
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email')
    .populate('doctor', 'name email professionalInfo.specialty')
    .sort({ date: -1, startTime: 1 })
    .lean();

  // Agregar información de videosesiones si existen
  const appointmentsWithVideo = await Promise.all(
    appointments.map(async (apt) => {
      const videoSession = await VideoSession.findOne({ 
        appointment: apt._id,
        status: 'ended'
      }).select('startedAt endedAt duration status').lean();
      
      return { ...apt, videoSession: videoSession || null };
    })
  );

  logger.info('Citas obtenidas exitosamente', {
    userId: user._id,
    role: user.role,
    count: appointmentsWithVideo.length
  });

  return NextResponse.json(
    { appointments: appointmentsWithVideo }, 
    { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60'
      }
    }
  );
});

// Validación para crear citas
const appointmentSchema = new ValidationSchema({
  doctorId: [
    validators.required('El ID del doctor es requerido'),
    validators.custom((value) => mongoose.Types.ObjectId.isValid(value), 'ID de doctor inválido')
  ],
  date: [
    validators.required('La fecha es requerida'),
    validators.pattern(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    validators.custom((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    }, 'La fecha no puede ser en el pasado')
  ],
  startTime: [
    validators.required('La hora de inicio es requerida'),
    validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)')
  ],
  endTime: [
    validators.required('La hora de fin es requerida'),
    validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)')
  ],
  specialty: [
    validators.required('La especialidad es requerida'),
    validators.minLength(3, 'La especialidad debe tener al menos 3 caracteres')
  ],
  reason: [
    validators.required('El motivo de la cita es requerido'),
    validators.minLength(10, 'El motivo debe tener al menos 10 caracteres'),
    validators.maxLength(500, 'El motivo no puede exceder 500 caracteres')
  ],
  type: [
    validators.custom(
      (value) => !value || ['consultation', 'follow-up', 'emergency'].includes(value),
      'Tipo de cita no válido'
    )
  ]
});

export const POST = asyncHandler(async (req) => {
  const session = await requireAuth(req);
  
  // Rate limiting: 5 citas por hora por usuario
  const clientId = session.user.email;
  const rateLimit = checkRateLimit(`appointments-${clientId}`, 5, 60 * 60 * 1000);
  
  if (!rateLimit.allowed) {
    logger.warn('Rate limit excedido al crear cita', { email: clientId });
    return NextResponse.json(
      { 
        error: 'Demasiados intentos de crear citas. Por favor, espera antes de intentar de nuevo.',
        retryAfter: Math.ceil(rateLimit.retryAfter / 1000)
      },
      { status: 429 }
    );
  }

  await dbConnect();

  const body = await req.json();
  
  // Sanitizar datos
  const sanitized = {
    doctorId: sanitizers.trim(body.doctorId),
    date: sanitizers.trim(body.date),
    startTime: sanitizers.trim(body.startTime),
    endTime: sanitizers.trim(body.endTime),
    type: sanitizers.trim(body.type),
    specialty: sanitizers.escape(sanitizers.trim(body.specialty)),
    reason: sanitizers.escape(sanitizers.trim(body.reason))
  };

  // Validar datos
  appointmentSchema.validate(sanitized);

  const { doctorId, date, startTime, endTime, type, specialty, reason } = sanitized;

  // Validar que endTime sea posterior a startTime
  if (startTime >= endTime) {
    return NextResponse.json(
      { error: 'La hora de fin debe ser posterior a la hora de inicio' },
      { status: 400 }
    );
  }

  const user = await getSessionUser(session);

  // Verificar que el doctor existe y tiene rol de doctor
  const doctor = await User.findById(doctorId).select('role name').lean();
  
  if (!doctor || doctor.role !== 'doctor') {
    logger.warn('Intento de crear cita con doctor inválido', { 
      doctorId, 
      patientId: user._id 
    });
    return NextResponse.json({ error: 'Doctor no válido' }, { status: 400 });
  }

  // Crear fecha en hora local correctamente (YYYY-MM-DD)
  const [year, month, day] = date.split('-').map(Number);
  const appointmentDate = new Date(year, month - 1, day, 12, 0, 0);

  // Verificar disponibilidad del doctor según su horario configurado
  const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
  
  if (schedule) {
    // Verificar si la fecha está bloqueada
    if (schedule.isDateBlocked(appointmentDate)) {
      logger.info('Intento de reservar fecha bloqueada', {
        doctorId,
        date: appointmentDate,
        patientId: user._id
      });
      return NextResponse.json(
        { error: 'El doctor no está disponible en esta fecha' },
        { status: 400 }
      );
    }

    // Verificar si el día de la semana está disponible
    const dayOfWeek = appointmentDate.getDay();
    const daySchedule = schedule.weeklySchedule.find(d => d.dayOfWeek === dayOfWeek);
    
    if (!daySchedule || !daySchedule.isAvailable) {
      return NextResponse.json(
        { error: 'El doctor no atiende este día de la semana' },
        { status: 400 }
      );
    }

    // Verificar que el horario solicitado esté dentro de los slots del doctor
    const isWithinSlots = daySchedule.timeSlots.some(slot => {
      return startTime >= slot.startTime && endTime <= slot.endTime;
    });

    if (!isWithinSlots) {
      return NextResponse.json(
        { error: 'El horario solicitado está fuera del horario de atención del doctor' },
        { status: 400 }
      );
    }

    // Verificar límites de reserva anticipada
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, startHour, startMinute, 0);
    
    const now = new Date();
    const minBookingDate = new Date(now.getTime() + schedule.minAdvanceBookingHours * 60 * 60 * 1000);
    const maxBookingDate = new Date(now.getTime() + schedule.allowBookingDaysInAdvance * 24 * 60 * 60 * 1000);

    if (appointmentDateTime < minBookingDate) {
      return NextResponse.json(
        { error: `Debe reservar con al menos ${schedule.minAdvanceBookingHours} horas de anticipación` },
        { status: 400 }
      );
    }

    if (appointmentDateTime > maxBookingDate) {
      return NextResponse.json(
        { error: `No puede reservar con más de ${schedule.allowBookingDaysInAdvance} días de anticipación` },
        { status: 400 }
      );
    }
  }

  // Verificar conflictos de horario
  const hasConflict = await Appointment.checkConflict(
    doctorId,
    appointmentDate,
    startTime,
    endTime
  );

  if (hasConflict) {
    logger.info('Conflicto de horario detectado', {
      doctorId,
      date: appointmentDate,
      startTime,
      endTime
    });
    return NextResponse.json(
      { error: 'El doctor ya tiene una cita en ese horario' },
      { status: 409 }
    );
  }

  // Crear cita
  const appointment = await Appointment.create({
    patient: user._id,
    doctor: doctorId,
    date: appointmentDate,
    startTime,
    endTime,
    type: type || 'consultation',
    specialty,
    reason,
    status: 'scheduled',
  });

  // Poblar datos para respuesta
  await appointment.populate('patient', 'name email');
  await appointment.populate('doctor', 'name email professionalInfo.specialty');

  logger.info('Cita creada exitosamente', {
    appointmentId: appointment._id,
    patientId: user._id,
    doctorId,
    date: appointmentDate,
    specialty
  });

  return NextResponse.json(
    { 
      success: true,
      appointment,
      message: 'Cita creada exitosamente'
    },
    { status: 201 }
  );
});