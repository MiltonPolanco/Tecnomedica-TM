import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import '@/models/User';
import bcrypt from 'bcrypt';

const User = mongoose.models.User || mongoose.model('User');

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URL);
}

// POST - Cambiar contraseña
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: 'Las contraseñas no coinciden' }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return Response.json({ error: 'La nueva contraseña debe ser diferente a la actual' }, { status: 400 });
    }

    await dbConnect();

    // Buscar usuario con contraseña
    const user = await User.findOne({ email: session.user.email }).select('+password');

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si el usuario se registró con Google, no tiene contraseña
    if (!user.password) {
      return Response.json({ 
        error: 'Tu cuenta usa autenticación de Google. No puedes cambiar la contraseña.' 
      }, { status: 400 });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    return Response.json({ 
      message: 'Contraseña actualizada exitosamente' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
