require('dotenv').config();
const nodemailer = require('nodemailer');

type Destinatario = {
    nombre: string;
    apellido: string;
    email: string;
};

function escapeHtml(value: string): string {
    return String(value || '').replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[character]));
}

let cachedTransporter: any = null;

async function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    if (!process.env.SMTP_HOST) {
        throw new Error('Falta SMTP_HOST. Configure un servidor SMTP real en el archivo .env.');
    }

    cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        tls: {
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        },
        auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        } : undefined
    });
    console.log('[EMAIL] Usando SMTP:', process.env.SMTP_HOST);

    return cachedTransporter;
}

/** Envía la confirmación después de guardar una solicitud exitosamente. */
export async function enviarEmailConfirmacion(destinatario: Destinatario, solicitudId: string) {
    if (!destinatario.email) {
        return { enviado: false, omitido: true };
    }

    const transporter = await getTransporter();
    const nombreCompleto = `${destinatario.nombre} ${destinatario.apellido}`.trim();
    const resultado = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: destinatario.email,
        subject: 'Confirmación de solicitud HUDS',
        text: `Hola ${nombreCompleto}. Recibimos tu solicitud HUDS. Número de solicitud: ${solicitudId}.`,
        html: `<p>Hola ${escapeHtml(nombreCompleto)}.</p><p>Recibimos tu solicitud HUDS correctamente.</p><p>Número de solicitud: <strong>${escapeHtml(solicitudId)}</strong></p>`
    });

    const preview = nodemailer.getTestMessageUrl(resultado);
    if (preview) {
        console.log('[EMAIL] Preview URL:', preview);
    }

    return { enviado: true, messageId: resultado.messageId, previewUrl: preview || null };
}

/** Envía un código de verificación de 6 dígitos por email. */
export async function enviarEmailCodigo(email: string, codigo: string) {
    if (!email) {
        return { enviado: false, omitido: true };
    }

    try {
        const transporter = await getTransporter();
        const resultado = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Código de verificación - ANDES Solicitudes HUDS',
            text: `Tu código de verificación para la solicitud HUDS es: ${codigo}`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #334851;">
                <h2 style="color: #6A972F;">Código de verificación</h2>
                <p>Ingresá el siguiente código de 6 dígitos para validar tu correo electrónico:</p>
                <div style="background-color: #F4F8F3; border: 2px dashed #83AC72; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; width: 200px;">
                    <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #334851;">${escapeHtml(codigo)}</span>
                </div>
                <p style="font-size: 12px; color: #777;">Este código es válido por 15 minutos.</p>
            </div>`
        });

        console.log(`[EMAIL] Código de verificación enviado a ${email}`);
        return { enviado: true, messageId: resultado.messageId };
    } catch (error) {
        console.error('[EMAIL ERROR] Error enviando código por email:', error.message);
        console.log(`[DEV FALLBACK] Código de verificación para ${email}: ${codigo}`);
        return { enviado: false, error: error.message };
    }
}

