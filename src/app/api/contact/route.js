
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { asyncHandler, AppError, logger } from '@/utils/errorHandler';
import { ValidationSchema, validators, sanitizeData } from '@/utils/validation';
import { checkRateLimit } from '@/utils/apiHelpers';

// Schema de validación para formulario de contacto
const contactSchema = new ValidationSchema({
  name: [
    validators.required('El nombre es requerido'),
    validators.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    validators.maxLength(100, 'El nombre no puede exceder 100 caracteres')
  ],
  email: [
    validators.required('El email es requerido'),
    validators.email('Email inválido')
  ],
  message: [
    validators.required('El mensaje es requerido'),
    validators.minLength(10, 'El mensaje debe tener al menos 10 caracteres'),
    validators.maxLength(1000, 'El mensaje no puede exceder 1000 caracteres')
  ],
});

// Configura tu transporte SMTP en las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const POST = asyncHandler(async (request) => {
  // 1. Rate Limiting - Prevenir spam
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`contact-${ip}`, 3, 600000); // 3 mensajes cada 10 minutos
  
  if (!rateLimit.allowed) {
    logger.warn('Rate limit excedido en contacto', { ip });
    throw new AppError(
      `Demasiados mensajes enviados. Intenta de nuevo en ${rateLimit.retryAfter} segundos`,
      429
    );
  }

  // 2. Obtener y sanitizar datos
  const body = await request.json();
  const sanitizedData = sanitizeData(body, {
    name: ['trim', 'escape'],
    email: ['trim', 'lowercase'],
    message: ['trim', 'escape'],
  });

  // 3. Validar datos
  contactSchema.validate(sanitizedData);

  // 4. Verificar configuración de email
  if (!process.env.CONTACT_RECEIVER || !process.env.SMTP_USER) {
    logger.error('Configuración de email incompleta', {
      hasReceiver: !!process.env.CONTACT_RECEIVER,
      hasSmtpUser: !!process.env.SMTP_USER,
    });
    throw new AppError('Servicio de contacto no disponible temporalmente', 503);
  }

  // 5. Enviar correo
  try {
    await transporter.sendMail({
      from: `"Tecnomedica - ${sanitizedData.name}" <${process.env.SMTP_USER}>`,
      replyTo: sanitizedData.email,
      to: process.env.CONTACT_RECEIVER,
      subject: `Nuevo mensaje de contacto: ${sanitizedData.name}`,
      text: sanitizedData.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nuevo mensaje de contacto</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Nombre:</strong> ${sanitizedData.name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${sanitizedData.email}</p>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0;">Mensaje:</h3>
            <p style="white-space: pre-wrap;">${sanitizedData.message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de Tecnomedica
          </p>
        </div>
      `,
    });

    // 6. Log del evento
    logger.info('Mensaje de contacto enviado', {
      from: sanitizedData.email,
      name: sanitizedData.name,
      ip,
    });

    // 7. Respuesta exitosa
    return NextResponse.json({ 
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
    }, { status: 200 });
    
  } catch (emailError) {
    logger.error('Error al enviar email', emailError, {
      from: sanitizedData.email,
      name: sanitizedData.name,
    });
    throw new AppError('No se pudo enviar el mensaje. Intenta nuevamente más tarde.', 500);
  }
});
