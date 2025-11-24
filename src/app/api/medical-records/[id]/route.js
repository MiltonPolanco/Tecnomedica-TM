import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { MedicalRecord } from '@/models/MedicalRecord';
import { Appointment } from '@/models/Appointment';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    return mongoose.connect(process.env.MONGO_URL);
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'name email phone bloodType')
      .populate('doctor', 'name email')
      .populate('appointment', 'appointmentType appointmentDate status')
      .lean();

    if (!record) {
      return NextResponse.json(
        { error: 'Historial no encontrado' },
        { status: 404 }
      );
    }

    if (
      session.user.role === 'patient' &&
      record.patient._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (
      session.user.role === 'doctor' &&
      record.doctor._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return NextResponse.json(
        { error: 'Historial no encontrado' },
        { status: 404 }
      );
    }

    if (record.doctor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone bloodType')
      .populate('doctor', 'name email')
      .populate('appointment', 'appointmentType appointmentDate status');

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error al actualizar historial:', error);
    return NextResponse.json(
      { error: 'Error al actualizar historial' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'doctor' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const record = await MedicalRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Historial no encontrado' },
        { status: 404 }
      );
    }

    if (session.user.role === 'doctor' && record.doctor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await MedicalRecord.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Historial eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar historial:', error);
    return NextResponse.json(
      { error: 'Error al eliminar historial' },
      { status: 500 }
    );
  }
}
