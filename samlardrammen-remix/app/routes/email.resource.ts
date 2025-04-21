import * as nodemailer from 'nodemailer';
import type { ActionFunctionArgs } from 'react-router';
const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOSTNAME,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

type SendEmailRequest = {
    to: string;
    bcc: string | string[];
    subject: string;
    text?: string;
    html?: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
    const requestBody: SendEmailRequest = await request.json();
    try {
        const request = {
            from: process.env.SMTP_USERNAME,
            to: requestBody.to,
            bcc: requestBody.bcc,
            subject: requestBody.subject,
            text: requestBody.text,
            html: requestBody.html,
        };
        console.log('Sending email', request);
        await new Promise<void>((resolve, reject) => {
            transport.sendMail(request, (error) => {
                console.error('Error sending email:', error, request);
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    } catch (error) {
        return new Response(error.message, { status: 500 });
    }

    return new Response(
        JSON.stringify({
            done: true,
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );
};
