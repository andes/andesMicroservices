import * as nodemailer from 'nodemailer';
import * as config from '../config.private';

export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: any;
}

export function sendMail(options: MailOptions) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: config.EMAIL_CONFIG.host,
            port: config.EMAIL_CONFIG.port,
            secure: config.EMAIL_CONFIG.secure,
            auth: {
                user: config.EMAIL_CONFIG.user,
                pass: config.EMAIL_CONFIG.pass
            },
        });

        const mailOptions = {
            from: options.from || config.EMAIL_CONFIG.user,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments
        };

        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                return reject(error);
            }
            return resolve(info);
        });
    });
}
