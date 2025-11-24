import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/libs/dbConnect';
import { Appointment } from '@/models/Appointment';
import { User } from '@/models/User';
import '@/models/DoctorSchedule';
import mongoose from 'mongoose';

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule');

// Importar authOptions
async function getAuthOptions() {
  const { default: NextAuth } = await import('next-auth');
  const authModule = await import('../auth/[...nextauth]/route');
  return authModule.authOptions || {};
}

// GET - Obtener citas del usuario
export async function GET(req) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Buscar el usuario completo para obtener su ID y rol
    const user = await User.findOne({ email: session.user.email })
      .select('_id role')
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Construir query según el rol
    let query = {};
    if (user.role === 'patient') {
      query.patient = user._id;
    } else if (user.role === 'doctor') {
      query.doctor = user._id;
    } else if (user.role === 'admin') {
      // Admin puede ver todas las citas
    } else {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 403 });
    }

    // Filtros adicionales
    if (status) {
      query.status = status;
    }

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

    return NextResponse.json(
      { appointments }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60'
        }
      }
    );
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva cita
export async function POST(req) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { doctorId, date, startTime, endTime, type, specialty, reason } = body;

    // Validaciones
    if (!doctorId || !date || !startTime || !endTime || !specialty || !reason) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Buscar paciente
    const patient = await User.findOne({ email: session.user.email })
      .select('_id')
      .lean();
    
    if (!patient) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el doctor existe y tiene rol de doctor
    const doctor = await User.findById(doctorId)
      .select('role')
      .lean();
    
    if (!doctor || doctor.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Doctor no válido' },
        { status: 400 }
      );
    }

    // Verificar disponibilidad del doctor según su horario configurado
    const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
    
    if (schedule) {
      const appointmentDate = new Date(date);
      
      // Verificar si la fecha está bloqueada
      if (schedule.isDateBlocked(appointmentDate)) {
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
      const now = new Date();
      const minBookingDate = new Date(now.getTime() + schedule.minAdvanceBookingHours * 60 * 60 * 1000);
      const maxBookingDate = new Date(now.getTime() + schedule.allowBookingDaysInAdvance * 24 * 60 * 60 * 1000);

      if (appointmentDate < minBookingDate) {
        return NextResponse.json(
          { error: `Debe reservar con al menos ${schedule.minAdvanceBookingHours} horas de anticipación` },
          { status: 400 }
        );
      }

      if (appointmentDate > maxBookingDate) {
        return NextResponse.json(
          { error: `No puede reservar con más de ${schedule.allowBookingDaysInAdvance} días de anticipación` },
          { status: 400 }
        );
      }
    }

    // Verificar conflictos de horario
    const hasConflict = await Appointment.checkConflict(
      doctorId,
      new Date(date),
      startTime,
      endTime
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: 'El doctor ya tiene una cita en ese horario' },
        { status: 409 }
      );
    }

    // Crear cita
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date),
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

    return NextResponse.json(
      { 
        success: true,
        appointment,
        message: 'Cita creada exitosamente'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear cita:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear cita' },
      { status: 500 }
    );
  }
}
