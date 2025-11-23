// src/app/api/doctors/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/libs/dbConnect';
import { User } from '@/models/User';

// GET - Obtener lista de doctores disponibles
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');

    let query = { role: 'doctor', isActive: true };

    if (specialty) {
      query['professionalInfo.specialty'] = specialty;
    }

    const doctors = await User.find(query)
      .select('name email professionalInfo image')
      .sort({ 'professionalInfo.specialty': 1, name: 1 });

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener doctores:', error);
    return NextResponse.json(
      { error: 'Error al obtener doctores' },
      { status: 500 }
    );
  }
}
