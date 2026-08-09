/**
 * Servicio de Envío de Correos (Email Service)
 * ---------------------------------------------
 * Centraliza el envío de correos electrónicos para la aplicación.
 *
 * Estrategia:
 *   - Si la variable de entorno EMAIL_PROVIDER está configurada ("nodemailer"),
 *     se usa Nodemailer con transporte SMTP (ideal para producción).
 *   - En caso contrario (desarrollo / pruebas), se simula el envío imprimiendo
 *     el contenido en consola, para no depender de un servidor SMTP real.
 *
 * Variables de entorno esperadas (ver .env.example):
 *   EMAIL_PROVIDER      = "nodemailer"  (opcional)
 *   SMTP_HOST           = host del servidor SMTP
 *   SMTP_PORT           = puerto (465, 587, etc.)
 *   SMTP_USER           = usuario SMTP
 *   SMTP_PASS           = contraseña SMTP
 *   SMTP_FROM           = dirección remitente (ej. no-reply@bibliotech.app)
 *   APP_BASE_URL        = URL base del frontend (ej. https://bibliotech.vercel.app)
 */

const nodemailer = require("nodemailer");

// ─── Transporte reutilizable (lazy init) ────────────────────────
let transporter = null;

/**
 * Crea (o devuelve cacheado) el transporte SMTP de Nodemailer.
 * @returns {object} Transporte configurado
 */
function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Envía el correo de recuperación de contraseña.
 *
 * En desarrollo imprime el enlace en consola; en producción usa SMTP.
 *
 * @param {string} toEmail  - Correo del destinatario
 * @param {string} token    - Token de recuperación (en claro, para el enlace)
 * @returns {Promise<void>}
 */
async function sendPasswordResetEmail(toEmail, token) {
  // Construir la URL de restablecimiento
  // En producción el frontend está en Vercel; APP_BASE_URL debe configurarse
  // en las variables de entorno de Render con la URL de Vercel.
  const baseUrl =
    process.env.APP_BASE_URL || "https://tercero-sofware.vercel.app";
  const resetUrl = `${baseUrl}/reset-password.html?token=${token}`;

  const subject = "BiblioTech — Recuperación de contraseña";
  const textBody = `
Hola,

Recibimos una solicitud para restablecer tu contraseña en BiblioTech.

Haz clic en el siguiente enlace para crear una nueva contraseña (válido por 15 minutos):
${resetUrl}

Si no solicitaste este cambio, puedes ignorar este correo; tu contraseña permanecerá sin cambios.

Saludos,
Equipo BiblioTech
  `.trim();

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1E4B65;">BiblioTech — Recuperación de contraseña</h2>
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña en BiblioTech.</p>
      <p>Haz clic en el botón para crear una nueva contraseña <strong>(válido por 15 minutos)</strong>:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}"
           style="background: #1E4B65; color: #fff; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: 600;">
          Restablecer contraseña
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p style="font-size: 13px; color: #666;">
        Si no solicitaste este cambio, puedes ignorar este correo; tu contraseña permanecerá sin cambios.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="font-size: 12px; color: #999;">Equipo BiblioTech</p>
    </div>
  `;

  // ─── Modo desarrollo: simular envío ───────────────────────────
  if (process.env.EMAIL_PROVIDER !== "nodemailer") {
    console.log("─────────────────────────────────────────────");
    console.log("📧 [MODO DESARROLLO] Correo simulado");
    console.log("Para:   ", toEmail);
    console.log("Asunto: ", subject);
    console.log("Enlace: ", resetUrl);
    console.log("─────────────────────────────────────────────");
    return;
  }

  // ─── Modo producción: envío real con Nodemailer ──────────────
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || "no-reply@bibliotech.app",
    to: toEmail,
    subject,
    text: textBody,
    html: htmlBody,
  });
}

module.exports = {
  sendPasswordResetEmail,
};
