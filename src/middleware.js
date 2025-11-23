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
    // Descomenta estas rutas cuando las implementes
    // "/mi-calendario/:path*",
    // "/doctor/:path*",
    // "/admin/:path*",
  ],
};
