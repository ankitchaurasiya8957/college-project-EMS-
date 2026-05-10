const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Check if email credentials are configured
const isEmailConfigured = () => {
    return process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.EMAIL_USER !== '@gmail.com' &&
        process.env.EMAIL_USER !== 'your_email@gmail.com' &&
        process.env.EMAIL_PASS !== 'your_app_password' &&
        process.env.EMAIL_PASS !== 'your_email_app_password_here';
};

let transporter = null;
if (isEmailConfigured()) {
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,          // false = STARTTLS (upgraded connection on port 587)
        requireTLS: true,       // Force TLS upgrade — required by Gmail
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS  // Must be a Gmail App Password (16 chars), NOT your Gmail login password
        },
        connectionTimeout: 10000,   // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false   // Prevents self-signed cert errors
        }
    });

    // Verify transporter config at startup so errors surface immediately
    transporter.verify((error) => {
        if (error) {
            console.error('❌ Email transporter verification FAILED:', error.message);
            console.error('   Check that EMAIL_USER and EMAIL_PASS are correct in .env');
            console.error('   EMAIL_PASS must be a Gmail App Password (not your Gmail login password)');
            console.error('   Generate one at: https://myaccount.google.com/apppasswords');
            transporter = null; // Fall back to console logging
        } else {
            console.log('✅ Email transporter ready — emails will be sent via:', process.env.EMAIL_USER);
        }
    });

    console.log('📧 Email transporter configured for:', process.env.EMAIL_USER);
} else {
    console.warn('⚠️  Email not configured. OTPs will be logged to console instead of emailed.');
    console.warn('   EMAIL_USER:', process.env.EMAIL_USER || '(not set)');
}

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    if (!transporter) {
        console.log(`📧 [MOCK] Booking confirmation email to ${userEmail} for "${eventTitle}"`);
        return;
    }
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to', userEmail);
    } catch (error) {
        console.error('❌ Error sending booking email:', error.message);
        // Don't throw — let the booking proceed even if email fails
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    // Always log OTP to console for development/debugging
    console.log(`\n🔐 ===== OTP for ${userEmail} =====`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log(`🔐 Type: ${type}`);
    console.log(`🔐 ================================\n`);

    if (!transporter) {
        console.log('📧 [MOCK] Email not configured — use the OTP from console above.');
        return; // Don't throw — OTP is available in console
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

    const mailOptions = {
        from: process.env.EMAIL_USER,
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${userEmail}`);
    } catch (error) {
        console.error('⚠️  Email send failed:', error.message);
        console.log('📧 Use the OTP from the console log above instead.');
        // Don't throw — OTP is still available in console logs
    }
};

/**
 * Fire-and-forget version of sendOTPEmail.
 * Sends the email in the background without blocking the API response.
 * The OTP is already stored in the database, so the response can go out immediately.
 */
const sendOTPEmailInBackground = (userEmail, otp, type) => {
    // Log OTP to console immediately (synchronous)
    console.log(`\n🔐 ===== OTP for ${userEmail} =====`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log(`🔐 Type: ${type}`);
    console.log(`🔐 ================================\n`);

    if (!transporter) {
        console.log('📧 [MOCK] Email not configured — use the OTP from console above.');
        return;
    }

    // Fire-and-forget: don't await
    sendOTPEmail(userEmail, otp, type).catch((err) => {
        console.error('⚠️  Background email send failed:', err.message);
    });
};

module.exports = { sendBookingEmail, sendOTPEmail, sendOTPEmailInBackground };
