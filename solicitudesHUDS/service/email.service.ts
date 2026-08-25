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
        from: process.env.SMTP_FROM || 'andes@hospitalneuquen.org.ar',
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
