import * as nodemailer from 'nodemailer';
import type { ActionFunctionArgs } from 'react-router';
const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOSTNAME,
    port: Number(process.env.SMTP_PORT),
    secure: Boolean(process.env.SMTP_SECURE),
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

type SendEmailRequest = {
    to: string;
    subject: string;
    text: string;
};
export const action = async ({ request }: ActionFunctionArgs) => {
    const requestBody: SendEmailRequest = await request.json();
    try {
        await new Promise<void>((resolve, reject) => {
            transport.sendMail(
                {
                    from: process.env.SMTP_FROM,
                    to: requestBody.to,
                    subject: requestBody.subject,
                    text: requestBody.text,
                },
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                }
            );
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
