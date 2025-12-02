import { NextResponse } from 'next/server';
import dbConnect from '@/libs/dbConnect';
import { User } from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Obtener todas las especialidades únicas de los doctores activos
    const specialties = await User.distinct('professionalInfo.specialty', {
      role: 'doctor',
      isActive: true,
      'professionalInfo.specialty': { $exists: true, $ne: null, $ne: '' }
    });

    // Filtrar valores nulos o vacíos
    const validSpecialties = specialties.filter(s => s && s.trim() !== '');

    return NextResponse.json({
      success: true,
      specialties: validSpecialties.sort()
    });
  } catch (error) {
    console.error('❌ Error al obtener especialidades:', error);
    return NextResponse.json(
      { error: 'Error al cargar especialidades' },
      { status: 500 }
    );
  }
}
