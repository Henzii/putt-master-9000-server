import nodemailer from 'nodemailer';
import { log } from '../utils/log';

type MailOptions = {
    from: string
    to: string
    subject: string
    text: string
}
export const sendEmail = (options: MailOptions) => {
    const user = process.env.MAIL_USER;
    const password = process.env.MAIL_PASSWORD;

    if (!user || !password) {
        throw new Error('User or password for nodemailer not set');
    }
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        transporter.sendMail(options);
        return true;
    } catch {
        log('Failed to send email');
        return false;
    }
};