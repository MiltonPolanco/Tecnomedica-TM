import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import '@/models/User';
import '@/models/DoctorSchedule';

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule');
const User = mongoose.models.User || mongoose.model('User');

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URL);
}

// GET - Obtener horarios del doctor
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    const doctor = await User.findOne({ email: session.user.email });
    if (!doctor || doctor.role !== 'doctor') {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    let schedule = await DoctorSchedule.findOne({ doctor: doctor._id });

    // Si no existe horario, crear uno por defecto
    if (!schedule) {
      schedule = await DoctorSchedule.createDefaultSchedule(doctor._id);
    }

    return Response.json({ schedule }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar horarios del doctor
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    const doctor = await User.findOne({ email: session.user.email });
    if (!doctor || doctor.role !== 'doctor') {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { weeklySchedule, consultationDuration, allowBookingDaysInAdvance, minAdvanceBookingHours } = body;

    let schedule = await DoctorSchedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      schedule = new DoctorSchedule({ doctor: doctor._id });
    }

    // Actualizar campos
    if (weeklySchedule) {
      schedule.weeklySchedule = weeklySchedule;
    }
    if (consultationDuration) {
      schedule.consultationDuration = consultationDuration;
    }
    if (allowBookingDaysInAdvance !== undefined) {
      schedule.allowBookingDaysInAdvance = allowBookingDaysInAdvance;
    }
    if (minAdvanceBookingHours !== undefined) {
      schedule.minAdvanceBookingHours = minAdvanceBookingHours;
    }

    await schedule.save();

    return Response.json({ 
      message: 'Horarios actualizados exitosamente',
      schedule 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Agregar fecha bloqueada
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    const doctor = await User.findOne({ email: session.user.email });
    if (!doctor || doctor.role !== 'doctor') {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { date, reason } = body;

    if (!date) {
      return Response.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    let schedule = await DoctorSchedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      schedule = await DoctorSchedule.createDefaultSchedule(doctor._id);
    }

    // Crear fecha en hora local (sin conversión UTC)
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria

    schedule.blockedDates.push({
      date: localDate,
      reason: reason || 'No disponible',
    });

    await schedule.save();

    return Response.json({ 
      message: 'Fecha bloqueada exitosamente',
      schedule 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al bloquear fecha:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar fecha bloqueada
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    const doctor = await User.findOne({ email: session.user.email });
    if (!doctor || doctor.role !== 'doctor') {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const blockedDateId = searchParams.get('blockedDateId');

    if (!blockedDateId) {
      return Response.json({ error: 'ID de fecha bloqueada requerido' }, { status: 400 });
    }

    const schedule = await DoctorSchedule.findOne({ doctor: doctor._id });

    if (!schedule) {
      return Response.json({ error: 'Horario no encontrado' }, { status: 404 });
    }

    // Eliminar la fecha bloqueada
    schedule.blockedDates = schedule.blockedDates.filter(
      d => d._id.toString() !== blockedDateId
    );

    await schedule.save();

    return Response.json({ 
      message: 'Fecha desbloqueada exitosamente',
      schedule 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al desbloquear fecha:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
