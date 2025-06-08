// /app/api/register/route.js
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function POST(req) {
  // Leer el cuerpo de la solicitud en formato JSON
  const body = await req.json();

  // Conectar a la base de datos si aún no se ha conectado.
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL, { autoIndex: true });
    // Forzamos la creación del índice (útil para desarrollo)
    await User.init();
  }

  try {
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
    const createdUser = await User.create(body);
    return new Response(JSON.stringify(createdUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Manejo de error si se produce una duplicación (código 11000)
    if (err.code === 11000) {
      return new Response(
        JSON.stringify({ error: "Email duplicado en la base de datos." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error al crear usuario:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
