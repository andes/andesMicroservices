import { SNS, config } from 'aws-sdk';

export interface SmsOptions {
    prefijo: string;
    subject: string;
    telefono: number;
    mensaje: string;
}

export function isPhoneValid(phone) {
    const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phone.match(regExp);
}

export async function sendSms(smsOptions: SmsOptions) {
    try {
        const prefix = smsOptions.prefijo ? smsOptions.prefijo : '+54';
        const argsOperador = {
            telefono: prefix + smsOptions.telefono
        };
        config.region = 'us-east-1';
        config.update({
            accessKeyId: process.env.ST_AWS_ACCESS_KEY,
            secretAccessKey: process.env.ST_AWS_SECRET_ACCESS_KEY,
        });
        const sms: SNS = new SNS();
        const params: any = {
            Message: smsOptions.mensaje,
            MessageStructure: 'string',
            PhoneNumber: argsOperador.telefono,
            Subject: 'ANDES'
        };
        return await sms.publish(params).promise();
    } catch (error) {
        return error;
    }
}

export function getData(body) {
    if (body.event === 'mpi:pacientes:create' ||
        body.event === 'mpi:pacientes:update') {
        const paciente = body.data;
        const celulares = paciente.contacto.filter(c => c && c.tipo && (c.tipo === 'celular'));
        if (celulares.length > 0) {
            const telefono = celulares[celulares.length - 1].valor || null;
            const subject = 'ANDES';
            const mensaje = 'El resultado de tu análisis de laboratorio está disponible. Podes visualizarlo en la aplicación móvil de ANDES.';
            return { subject, telefono, mensaje };
        }
    }
    return body;
}
