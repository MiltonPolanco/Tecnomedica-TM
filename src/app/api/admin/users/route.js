import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import '@/models/User';

const User = mongoose.models.User || mongoose.model('User');

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URL);
}

// GET - Listar todos los usuarios (solo admin)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return Response.json({ error: 'No autorizado - Solo administradores' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name email role phone bloodType isActive createdAt professionalInfo')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar rol de usuario (solo admin)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return Response.json({ error: 'No autorizado - Solo administradores' }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();
    const { userId, role, specialty, isActive } = body;

    if (!userId) {
      return Response.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar rol
    if (role && ['patient', 'doctor', 'admin'].includes(role)) {
      user.role = role;
    }

    // Si se cambia a doctor y se proporciona especialidad
    if (role === 'doctor' && specialty) {
      if (!user.professionalInfo) {
        user.professionalInfo = {};
      }
      user.professionalInfo.specialty = specialty;
    }

    // Actualizar estado activo/inactivo
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .select('name email role phone bloodType isActive createdAt professionalInfo')
      .lean();

    return Response.json({ 
      message: 'Usuario actualizado exitosamente',
      user: updatedUser 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
