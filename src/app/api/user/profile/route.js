import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import '@/models/User';

const User = mongoose.models.User || mongoose.model('User');

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URL);
}

// GET - Obtener perfil del usuario
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email })
      .select('name email phone bloodType role createdAt')
      .lean();

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar perfil del usuario
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, bloodType } = body;

    // Validaciones
    if (!name || name.trim().length < 2) {
      return Response.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 });
    }

    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      return Response.json({ error: 'Formato de teléfono inválido' }, { status: 400 });
    }

    if (bloodType && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodType)) {
      return Response.json({ error: 'Tipo de sangre inválido' }, { status: 400 });
    }

    await dbConnect();

    // Actualizar usuario
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name: name.trim(),
        phone: phone?.trim() || '',
        bloodType: bloodType || '',
      },
      { new: true, select: 'name email phone bloodType role createdAt' }
    ).lean();

    if (!updatedUser) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Perfil actualizado exitosamente',
      user: updatedUser 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
