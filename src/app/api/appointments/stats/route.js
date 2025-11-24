import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import '@/models/User';
import '@/models/Appointment';

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment');
const User = mongoose.models.User || mongoose.model('User');

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URL);
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'doctor' && session.user.role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    await dbConnect();

    const doctor = await User.findOne({ email: session.user.email });
    if (!doctor) {
      return Response.json({ error: 'Doctor no encontrado' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Citas de hoy
    const todayAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
    });

    // Citas de esta semana
    const weekAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: today, $lt: nextWeek },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
    });

    // Citas del mes
    const monthAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ['scheduled', 'confirmed', 'completed'] },
    });

    // Total de pacientes únicos
    const uniquePatients = await Appointment.distinct('patient', {
      doctor: doctor._id,
      status: { $ne: 'cancelled' },
    });

    // Citas por estado este mes
    const statusStats = await Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Próximas citas (siguientes 5)
    const upcomingAppointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] },
    })
      .populate('patient', 'name email phone')
      .sort({ date: 1, startTime: 1 })
      .limit(5)
      .lean();

    return Response.json({
      stats: {
        todayAppointments,
        weekAppointments,
        monthAppointments,
        totalPatients: uniquePatients.length,
        statusBreakdown: statusStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
      upcomingAppointments,
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
