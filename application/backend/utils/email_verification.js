import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendVerificationEmail(toEmail, token) {
    const verifyUrl = `${process.env.FRONTEND_URL}/api/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"Vibe Check" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verify your Vibe Check account',
        html: `
            <h2>Welcome to Vibe Check!</h2>
            <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
            <a href="${verifyUrl}" style="
                display:inline-block;
                padding:12px 24px;
                background:#6c63ff;
                color:#fff;
                border-radius:6px;
                text-decoration:none;
                font-weight:bold;
            ">Verify Email</a>
            <p>Or copy this link: ${verifyUrl}</p>
        `,
    });
}