import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { VideoSession } from '@/models/VideoSession';
import { Appointment } from '@/models/Appointment';
import { v4 as uuidv4 } from 'uuid';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    return mongoose.connect(process.env.MONGO_URL);
  }
}

// Crear nueva sesión de video
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const { appointmentId } = await request.json();

    // Verificar que la cita existe y pertenece al doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    if (appointment.doctor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado para esta cita' }, { status: 403 });
    }

    if (appointment.status !== 'confirmed') {
      return NextResponse.json({ error: 'La cita debe estar confirmada' }, { status: 400 });
    }

    // Verificar si ya existe una sesión activa para esta cita
    const existingSession = await VideoSession.findOne({
      appointment: appointmentId,
      status: { $in: ['waiting', 'active'] }
    });

    if (existingSession) {
      return NextResponse.json(existingSession);
    }

    // Crear nueva sesión con roomId único
    const roomId = `tecnomedica-${uuidv4()}`;
    const videoSession = await VideoSession.create({
      appointment: appointmentId,
      doctor: session.user.id,
      patient: appointment.patient,
      roomId,
      status: 'waiting'
    });

    const populatedSession = await VideoSession.findById(videoSession._id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email');

    return NextResponse.json(populatedSession, { status: 201 });
  } catch (error) {
    console.error('Error al crear sesión de video:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión de video' },
      { status: 500 }
    );
  }
}

// Obtener sesiones (por appointmentId)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId requerido' }, { status: 400 });
    }

    const videoSession = await VideoSession.findOne({
      appointment: appointmentId,
      status: { $in: ['waiting', 'active'] }
    })
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'appointmentType appointmentDate');

    if (!videoSession) {
      return NextResponse.json({ session: null });
    }

    // Verificar que el usuario sea parte de la sesión
    if (
      session.user.id !== videoSession.doctor._id.toString() &&
      session.user.id !== videoSession.patient._id.toString()
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(videoSession);
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    );
  }
}
