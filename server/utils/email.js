const nodemailer = require('nodemailer');

// ── Lazy transporter: created on first use, not at import time ──
let _transporter = null;
let _transporterChecked = false;

function getTransporter() {
    if (_transporterChecked) return _transporter;
    _transporterChecked = true;

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass ||
        user === '@gmail.com' ||
        user === 'your_email@gmail.com' ||
        pass === 'your_app_password' ||
        pass === 'your_email_app_password_here') {
        console.warn('⚠️  Email not configured. OTPs will be logged to console only.');
        console.warn('   EMAIL_USER:', user || '(not set)');
        _transporter = null;
        return null;
    }

    _transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: { rejectUnauthorized: false }
    });

    console.log('📧 Email transporter created for:', user);
    return _transporter;
}

// ── Send OTP Email ──
const sendOTPEmail = async (userEmail, otp, type) => {
    // ALWAYS log to console first — this is the safety net
    console.log(`\n🔐 ===== OTP for ${userEmail} =====`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log(`🔐 Type: ${type}`);
    console.log(`🔐 ================================\n`);

    const transporter = getTransporter();
    if (!transporter) {
        console.log('📧 [MOCK] No email transporter — use OTP from console above.');
        return;
    }

    const titles = {
        account_verification: 'Verify your Eventora Account',
        event_booking: 'Eventora Booking Verification',
        password_reset: 'Reset your Eventora Password'
    };
    const msgs = {
        account_verification: 'Please use the following OTP to verify your new Eventora account.',
        event_booking: 'Please use the following OTP to verify and confirm your event booking.',
        password_reset: 'Please use the following OTP to reset your password. If you did not request this, you can safely ignore this email.'
    };

    const title = titles[type] || 'Eventora Verification';
    const msg = msgs[type] || 'Please use the following OTP to complete your request.';

    try {
        await transporter.sendMail({
            from: `"Eventora" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        });
        console.log(`✅ OTP email sent successfully to ${userEmail}`);
    } catch (error) {
        console.error(`❌ Email send FAILED to ${userEmail}:`, error.message);
        console.error('   Error code:', error.code || 'none');
        console.log('📧 Use the OTP from the console log above instead.');
        // Don't throw — OTP is still in console
    }
};

// ── Fire-and-forget wrapper ──
const sendOTPEmailInBackground = (userEmail, otp, type) => {
    // Don't await — just fire and forget
    sendOTPEmail(userEmail, otp, type).catch((err) => {
        console.error('⚠️  Background email failed:', err.message);
    });
};

// ── Booking confirmation email ──
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    const transporter = getTransporter();
    if (!transporter) {
        console.log(`📧 [MOCK] Booking confirmation to ${userEmail} for "${eventTitle}"`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `"Eventora" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
                <h2>Hi ${userName}!</h2>
                <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
                <p>Thank you for choosing Eventora.</p>
            `
        });
        console.log('✅ Booking email sent to', userEmail);
    } catch (error) {
        console.error('❌ Booking email failed:', error.message);
    }
};

module.exports = { sendBookingEmail, sendOTPEmail, sendOTPEmailInBackground };
