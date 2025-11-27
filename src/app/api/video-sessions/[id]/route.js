import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { VideoSession } from '@/models/VideoSession';
import { Appointment } from '@/models/Appointment';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    return mongoose.connect(process.env.MONGO_URL);
  }
}

// Actualizar estado de sesión (unirse o finalizar)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { action } = await request.json(); // 'join' o 'end'

    const videoSession = await VideoSession.findById(id);
    if (!videoSession) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    // Verificar que el usuario sea parte de la sesión
    if (
      session.user.id !== videoSession.doctor.toString() &&
      session.user.id !== videoSession.patient.toString()
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (action === 'join') {
      // Marcar como activa cuando alguien se une
      videoSession.status = 'active';
      await videoSession.save();
    } else if (action === 'end') {
      // Solo el doctor puede finalizar
      if (session.user.role !== 'doctor') {
        return NextResponse.json({ error: 'Solo el doctor puede finalizar' }, { status: 403 });
      }

      videoSession.status = 'ended';
      videoSession.endedAt = new Date();
      
      // Calcular duración en minutos
      const duration = Math.round((videoSession.endedAt - videoSession.startedAt) / (1000 * 60));
      videoSession.duration = duration;
      
      await videoSession.save();
    }

    const updatedSession = await VideoSession.findById(id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'appointmentType appointmentDate');

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return NextResponse.json(
      { error: 'Error al actualizar sesión' },
      { status: 500 }
    );
  }
}

// Obtener sesión por ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const videoSession = await VideoSession.findById(id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'appointmentType appointmentDate');

    if (!videoSession) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    // Verificar autorización
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
