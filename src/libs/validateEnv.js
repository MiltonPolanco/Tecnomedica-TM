// src/libs/validateEnv.js

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 * Llamar esto al inicio de la aplicación para fallar rápido si falta configuración
 */
export function validateEnv() {
  const required = [
    'MONGO_URL',
    'SECRET',
    'NEXTAUTH_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Variables de entorno faltantes: ${missing.join(', ')}\n` +
      'Por favor revisa tu archivo .env'
    );
  }

  // Warnings para variables opcionales pero recomendadas
  const optional = {
    'GOOGLE_CLIENT_ID': 'OAuth con Google no estará disponible',
    'SMTP_HOST': 'El formulario de contacto no funcionará',
    'SMTP_USER': 'El formulario de contacto no funcionará',
    'SMTP_PASS': 'El formulario de contacto no funcionará',
  };

  Object.entries(optional).forEach(([key, message]) => {
    if (!process.env[key]) {
      console.warn(`⚠️  ${key} no está configurado: ${message}`);
    }
  });

  console.log('✅ Variables de entorno validadas correctamente');
}
