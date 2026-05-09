const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendOTPEmailInBackground } = require('../utils/email');

const OTP_EXPIRY_MINUTES = 10; // OTP valid for 10 minutes

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: create and store a new OTP
const createOTP = async (email, action) => {
    const otp = generateOTP();
    await OTP.findOneAndDelete({ email, action }); // Remove any old OTP for this email+action
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await OTP.create({ email, otp, action, expiresAt });
    return otp;
};

// Helper: find and validate an OTP (with manual expiry check)
const findValidOTP = async (email, otp, action) => {
    const record = await OTP.findOne({ email, otp, action });
    if (!record) return null;

    // Manual expiry check
    if (new Date() > record.expiresAt) {
        await OTP.deleteOne({ _id: record._id }); // Cleanup expired
        return null;
    }
    return record;
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            isVerified: false
        });

        // Generate and store OTP
        const otp = await createOTP(email, 'account_verification');

        // Send OTP email (won't throw even if email is not configured — OTP logs to console)
        await sendOTPEmail(email, otp, 'account_verification');

        console.log(`✅ User registered: ${email} | OTP created`);

        res.status(201).json({
            message: 'Registration successful! Please check your email for the OTP to verify your account.',
            email: user.email
        });
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified && user.role !== 'admin') {
            // Re-send OTP for unverified users
            const otp = await createOTP(user.email, 'account_verification');
            sendOTPEmailInBackground(user.email, otp, 'account_verification');

            return res.status(403).json({
                message: 'Account not verified. A new OTP has been sent to your email.',
                needsVerification: true,
                email: user.email
            });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        console.log(`🔍 Verifying OTP for ${email}: received "${otp}"`);

        const validOTP = await findValidOTP(email, otp, 'account_verification');

        if (!validOTP) {
            console.log(`❌ OTP verification failed for ${email}`);
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after successful verification

        console.log(`✅ User verified: ${email}`);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error('❌ OTP verification error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Resend OTP endpoint
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        const otp = await createOTP(email, 'account_verification');
        await sendOTPEmail(email, otp, 'account_verification');

        console.log(`🔄 OTP resent for ${email}`);

        res.json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        console.error('❌ Resend OTP error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Forgot Password - Send OTP to email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide your email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't reveal whether email exists
            return res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
        }

        const otp = await createOTP(email, 'password_reset');
        sendOTPEmailInBackground(email, otp, 'password_reset');

        console.log(`🔑 Password reset OTP sent for ${email}`);

        res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
    } catch (error) {
        console.error('❌ Forgot password error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Verify Forgot Password OTP
exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        console.log(`🔍 Verifying password reset OTP for ${email}: received "${otp}"`);

        const validOTP = await findValidOTP(email, otp, 'password_reset');

        if (!validOTP) {
            console.log(`❌ Password reset OTP verification failed for ${email}`);
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        // Don't delete the OTP yet — it will be validated again during resetPassword
        // Generate a short-lived reset token so the client can proceed to set new password
        const resetToken = jwt.sign(
            { email, otpId: validOTP._id.toString(), purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        console.log(`✅ Password reset OTP verified for ${email}`);

        res.json({
            message: 'OTP verified successfully. You can now set a new password.',
            resetToken
        });
    } catch (error) {
        console.error('❌ Reset OTP verification error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Reset Password with verified token
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Please provide reset token and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Verify the reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Reset session expired. Please start again.' });
        }

        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        // Check that the OTP record still exists (not yet used)
        const otpRecord = await OTP.findById(decoded.otpId);
        if (!otpRecord) {
            return res.status(400).json({ message: 'Reset session expired or already used. Please start again.' });
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Hash new password and update
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Cleanup the OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        console.log(`✅ Password reset successful for ${decoded.email}`);

        res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
    } catch (error) {
        console.error('❌ Reset password error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
