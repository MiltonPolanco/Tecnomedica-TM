// /app/api/register/route.js
import { User } from "@/models/User";
import dbConnect from "@/libs/dbConnect";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Leer el cuerpo de la solicitud en formato JSON
    const body = await req.json();

    // Validaciones básicas
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Verificar si ya existe un usuario con el mismo email.
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Este email ya está registrado." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear un nuevo usuario en la base de datos.
    const createdUser = await User.create({
      email: body.email,
      password: body.password,
      name: body.name || '',
      role: body.role || 'patient',
    });
    
    return NextResponse.json(
      { 
        success: true,
        message: "Usuario creado exitosamente",
        user: createdUser.toPublicJSON()
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error al crear usuario:", err);
    
    // Manejo de error si se produce una duplicación (código 11000)
    if (err.code === 11000) {
      return new Response(
        JSON.stringify({ error: "Email duplicado en la base de datos." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return NextResponse.json(
        { error: "Error de validación", details: errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
