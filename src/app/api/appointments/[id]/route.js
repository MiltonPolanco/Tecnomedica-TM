// src/app/api/appointments/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/libs/dbConnect';
import { Appointment } from '@/models/Appointment';
import { User } from '@/models/User';

// Importar authOptions
async function getAuthOptions() {
  const authModule = await import('../../auth/[...nextauth]/route');
  return authModule.authOptions || {};
}

export async function GET(req, { params }) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const appointment = await Appointment.findById(params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone professionalInfo');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga acceso a esta cita
    const user = await User.findOne({ email: session.user.email });
    
    if (
      user.role !== 'admin' &&
      appointment.patient._id.toString() !== user._id.toString() &&
      appointment.doctor._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      );
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener cita:', error);
    return NextResponse.json(
      { error: 'Error al obtener cita' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { status, notes, cancelReason } = body;

    const appointment = await Appointment.findById(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    // Verificar permisos
    if (
      user.role !== 'admin' &&
      appointment.patient.toString() !== user._id.toString() &&
      appointment.doctor.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta cita' },
        { status: 403 }
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        appointment,
        message: 'Cita actualizada exitosamente'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cita' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cita (solo admin)
export async function DELETE(req, { params }) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar citas' },
        { status: 403 }
      );
    }

    const appointment = await Appointment.findByIdAndDelete(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cita eliminada exitosamente'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cita' },
      { status: 500 }
    );
  }
}
