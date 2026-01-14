'use server';

import nodemailer from 'nodemailer';

const {
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD,
    EMAIL_FROM
} = process.env;

// This function sends an OTP email.
// In a production environment, it uses nodemailer to send a real email.
// In a development environment (or if email variables are not set), it logs the OTP to the console.
export async function sendOtpEmail(to: string, otp: string) {
    // If any of the required environment variables for email are missing,
    // we fall back to logging the OTP to the console.
    if (!EMAIL_SERVER_HOST || !EMAIL_SERVER_PORT || !EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD || !EMAIL_FROM) {
        console.log('\n\n--- DEVELOPMENT OTP ---');
        console.log(`Email configuration is missing in .env.local. OTP for ${to} is: ${otp}`);
        console.log('-----------------------\n\n');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: EMAIL_SERVER_HOST,
        port: Number(EMAIL_SERVER_PORT),
        secure: false, // Set to false for port 587
        requireTLS: true, // Add this to enforce STARTTLS for port 587
        auth: {
            user: EMAIL_SERVER_USER,
            pass: EMAIL_SERVER_PASSWORD,
        },
    });

    const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject: 'Your One-Time Password (OTP) for Fuel Station Manager',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Your OTP Code</h2>
                <p>Please use the following code to complete your registration. This code is valid for 10 minutes.</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f2f2f2; padding: 10px 20px; display: inline-block;">
                    ${otp}
                </p>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${to}`);
    } catch (error: any) {
        console.error('Error sending OTP email:', error);
        // Throw a more specific error to be caught by the action
        throw new Error(`Failed to send email. Reason: ${error.message}`);
    }
}
