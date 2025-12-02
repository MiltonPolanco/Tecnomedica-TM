// src/middleware.js
import { withAuth } from "next-auth/middleware";

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Configurar qué rutas proteger
export const config = {
  matcher: [
    "/mi-calendario/:path*",
    "/mis-citas/:path*",
    "/mi-historial/:path*",
    "/agendar-cita/:path*",
    "/perfil/:path*",
    "/doctor/:path*",
    "/dashboard-doctor/:path*",
    "/admin/:path*",
    "/video-call/:path*",
  ],
};
