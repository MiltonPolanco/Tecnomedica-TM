
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configura tu transporte SMTP en las variables de entorno:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request) {
  try {
    const { name, email, message } = await request.json()

    // Opcional: valida aquí los campos...

    // Envía el correo
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.CONTACT_RECEIVER,        // tu email destino
      subject: `Nuevo mensaje de ${name}`,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p><p>De: ${name} (${email})</p>`,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Contact API Error:', err)
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 })
  }
}
