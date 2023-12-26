import nodemailer from 'nodemailer';

import config from '../config';

export const transporter = nodemailer.createTransport({
    host: config.nodemailer.host,
    port: Number(config.nodemailer.port),
    secure: Number(config.nodemailer.port) === 465,
    auth: {
        pass: config.nodemailer.authPass,
        user: config.nodemailer.authUser,
    },
});

export type MessageBody = {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
};

const message = ({ from, to, subject, text, html }: MessageBody) => ({
    from: `${from} <${config.nodemailer.authUser}>`,
    to,
    subject,
    text,
    ...(html && { html }),
});

export const sendMail = (body: MessageBody) => {
    if (!config.nodemailer.enabled) return;

    return transporter.sendMail(message(body));
};
