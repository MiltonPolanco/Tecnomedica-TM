import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import '@/models/User';
import '@/models/DoctorSchedule';
import '@/models/Appointment';

const DoctorSchedule = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule');
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment');
const User = mongoose.models.User || mongoose.model('User');

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URL);
}

// GET - Obtener disponibilidad de un doctor para una fecha específica
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return Response.json({ error: 'Doctor ID y fecha son requeridos' }, { status: 400 });
    }

    // Obtener horario del doctor
    let schedule = await DoctorSchedule.findOne({ doctor: doctorId });

    if (!schedule) {
      // Crear horario por defecto si no existe
      schedule = await DoctorSchedule.createDefaultSchedule(doctorId);
    }

    const targetDate = new Date(date);
    // Normalizar a medianoche en hora local
    targetDate.setHours(0, 0, 0, 0);
    const dayOfWeek = targetDate.getDay();

    // Verificar si el día está disponible
    const daySchedule = schedule.weeklySchedule.find(day => day.dayOfWeek === dayOfWeek);
    
    if (!daySchedule || !daySchedule.isAvailable) {
      return Response.json({ 
        availableSlots: [],
        message: 'El doctor no atiende este día'
      }, { status: 200 });
    }

    // Verificar si la fecha está bloqueada
    if (schedule.isDateBlocked(targetDate)) {
      return Response.json({ 
        availableSlots: [],
        message: 'Esta fecha no está disponible'
      }, { status: 200 });
    }

    // Obtener citas existentes para esa fecha
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
    }).select('startTime endTime').lean();

    // Generar todos los slots posibles del día
    const availableSlots = [];
    const consultationDuration = schedule.consultationDuration;

    for (const timeSlot of daySchedule.timeSlots) {
      const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
      const [endHour, endMin] = timeSlot.endTime.split(':').map(Number);

      let currentMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      while (currentMinutes + consultationDuration <= endMinutes) {
        const slotStartHour = Math.floor(currentMinutes / 60);
        const slotStartMin = currentMinutes % 60;
        const slotEndMinutes = currentMinutes + consultationDuration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;

        const startTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
        const endTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

        // Verificar si este slot está ocupado
        const isOccupied = existingAppointments.some(apt => {
          return (startTime >= apt.startTime && startTime < apt.endTime) ||
                 (endTime > apt.startTime && endTime <= apt.endTime) ||
                 (startTime <= apt.startTime && endTime >= apt.endTime);
        });

        // Verificar que no sea una hora pasada si es hoy
        const now = new Date();
        const isToday = targetDate.toDateString() === now.toDateString();
        const isPast = isToday && (slotStartHour * 60 + slotStartMin) <= (now.getHours() * 60 + now.getMinutes() + schedule.minAdvanceBookingHours * 60);

        if (!isOccupied && !isPast) {
          availableSlots.push({
            startTime,
            endTime,
            available: true,
          });
        }

        currentMinutes += consultationDuration;
      }
    }

    return Response.json({ 
      availableSlots,
      consultationDuration,
      date: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
