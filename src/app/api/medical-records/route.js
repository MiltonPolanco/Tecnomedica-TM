import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { MedicalRecord } from '@/models/MedicalRecord';
import { User } from '@/models/User';
import { Appointment } from '@/models/Appointment';
import { Notification } from '@/models/Notification';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    return mongoose.connect(process.env.MONGO_URL);
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    let query = {};

    if (session.user.role === 'doctor') {
      query.doctor = session.user.id;
      if (patientId) {
        query.patient = patientId;
      }
    } else if (session.user.role === 'patient') {
      query.patient = session.user.id;
    } else if (session.user.role === 'admin') {
      if (patientId) query.patient = patientId;
      if (doctorId) query.doctor = doctorId;
    } else {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email')
      .populate('appointment', 'appointmentType status')
      .sort({ consultDate: -1 })
      .lean();

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error al obtener historiales:', error);
    return NextResponse.json(
      { error: 'Error al obtener historiales' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const data = await request.json();

    const patientExists = await User.findById(data.patient);
    if (!patientExists || patientExists.role !== 'patient') {
      return NextResponse.json(
        { error: 'Paciente no válido' },
        { status: 400 }
      );
    }

    // Limpiar appointment si está vacío
    const recordData = {
      ...data,
      doctor: session.user.id
    };

    if (!recordData.appointment || recordData.appointment === '') {
      delete recordData.appointment;
    }

    const newRecord = await MedicalRecord.create(recordData);

    const populatedRecord = await MedicalRecord.findById(newRecord._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email')
      .populate('appointment', 'appointmentType status');

    // Trigger Notification if exams were added
    // Trigger Notification
    let title = 'Nuevo Historial Médico';
    let message = `El Dr. ${session.user.name} ha creado un nuevo historial médico.`;
    let type = 'info';

    if (newRecord.exams && newRecord.exams.length > 0) {
      title = 'Nuevos resultados de exámenes';
      message = `El Dr. ${session.user.name} ha agregado nuevos resultados de exámenes a tu historial.`;
      type = 'success';
    }

    await Notification.create({
      userId: newRecord.patient,
      title,
      message,
      type,
      link: `/mi-historial/${newRecord._id}`
    });

    return NextResponse.json(populatedRecord, { status: 201 });
  } catch (error) {
    console.error('Error al crear historial:', error);
    return NextResponse.json(
      { error: 'Error al crear historial médico' },
      { status: 500 }
    );
  }
}
