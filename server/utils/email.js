const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Check if email credentials are configured
const isEmailConfigured = () => {
    return process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.EMAIL_USER !== '@gmail.com' &&
        process.env.EMAIL_USER !== 'your_email@gmail.com' &&
        process.env.EMAIL_PASS !== 'your_app_password';
};

let transporter = null;
if (isEmailConfigured()) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('📧 Email transporter configured for:', process.env.EMAIL_USER);
} else {
    console.warn('⚠️  Email not configured. OTPs will be logged to console instead of emailed.');
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
        throw new Error('Failed to send booking email');
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

    const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
    const msg = type === 'account_verification'
        ? 'Please use the following OTP to verify your new Eventora account.'
        : 'Please use the following OTP to verify and confirm your event booking.';

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
                <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
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

module.exports = { sendBookingEmail, sendOTPEmail };
