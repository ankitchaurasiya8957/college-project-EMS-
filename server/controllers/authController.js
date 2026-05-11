const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendOTPEmailInBackground } = require('../utils/email');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

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

/**
 * POST /api/auth/register
 * Registers a new user and sends OTP for verification
 */
exports.register = asyncHandler(async (req, res, next) => {
    let { name, email, password } = req.body;

    email = email.trim();

    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorResponse('User already exists', 400));
    }

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
        success: true,
        message: 'Registration successful! Please check your email for the OTP to verify your account.',
        email: user.email
    });
});

/**
 * POST /api/auth/login
 * Authenticates user with email/password
 */
exports.login = asyncHandler(async (req, res, next) => {
    let { email, password } = req.body;

    email = email.trim();

    const user = await User.findOne({ email });
    if (!user) {
        console.log(`❌ Login failed: Email not found (${email})`);
        return next(new ErrorResponse('Invalid credentials', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log(`❌ Login failed: Incorrect password for (${email})`);
        return next(new ErrorResponse('Invalid credentials', 400));
    }

    if (!user.isVerified && user.role !== 'admin') {
        // Re-send OTP for unverified users
        const otp = await createOTP(user.email, 'account_verification');
        sendOTPEmailInBackground(user.email, otp, 'account_verification');

        return res.status(403).json({
            success: false,
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
        profilePhoto: user.profilePhoto,
        token: generateToken(user.id, user.role)
    });
});

/**
 * POST /api/auth/verify-otp
 * Verifies account creation OTP
 */
exports.verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    console.log(`🔍 Verifying OTP for ${email}: received "${otp}"`);

    const validOTP = await findValidOTP(email, otp, 'account_verification');

    if (!validOTP) {
        console.log(`❌ OTP verification failed for ${email}`);
        return next(new ErrorResponse('Invalid or expired OTP. Please try again.', 400));
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) {
        return next(new ErrorResponse('User not found', 400));
    }

    await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after successful verification

    console.log(`✅ User verified: ${email}`);

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        token: generateToken(user.id, user.role)
    });
});

/**
 * POST /api/auth/resend-otp
 * Resends account verification OTP
 */
exports.resendOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorResponse('Please provide email', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorResponse('User not found', 400));
    }

    if (user.isVerified) {
        return next(new ErrorResponse('Account is already verified', 400));
    }

    const otp = await createOTP(email, 'account_verification');
    await sendOTPEmail(email, otp, 'account_verification');

    console.log(`🔄 OTP resent for ${email}`);

    res.json({ success: true, message: 'A new OTP has been sent to your email.' });
});

/**
 * POST /api/auth/forgot-password
 * Sends password reset OTP (security: does not reveal if email exists)
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        console.log(`⚠️  Forgot Password requested for non-existent email: ${email}. To prevent enumeration, pretending it sent.`);
        // Security: Don't reveal whether email exists
        return res.json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });
    }

    const otp = await createOTP(email, 'password_reset');
    sendOTPEmailInBackground(email, otp, 'password_reset');

    console.log(`🔑 Password reset OTP sent for ${email}`);

    res.json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });
});

/**
 * POST /api/auth/verify-reset-otp
 * Verifies the password reset OTP and issues a reset token
 */
exports.verifyResetOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorResponse('Please provide email and OTP', 400));
    }

    console.log(`🔍 Verifying password reset OTP for ${email}: received "${otp}"`);

    const validOTP = await findValidOTP(email, otp, 'password_reset');

    if (!validOTP) {
        console.log(`❌ Password reset OTP verification failed for ${email}`);
        return next(new ErrorResponse('Invalid or expired OTP. Please try again.', 400));
    }

    // Generate a short-lived reset token so the client can proceed to set new password
    const resetToken = jwt.sign(
        { email, otpId: validOTP._id.toString(), purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );

    console.log(`✅ Password reset OTP verified for ${email}`);

    res.json({
        success: true,
        message: 'OTP verified successfully. You can now set a new password.',
        resetToken
    });
});

/**
 * POST /api/auth/reset-password
 * Resets password using a verified reset token
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { resetToken, newPassword } = req.body;

    // Verify the reset token
    let decoded;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
        return next(new ErrorResponse('Reset session expired. Please start again.', 400));
    }

    if (decoded.purpose !== 'password_reset') {
        return next(new ErrorResponse('Invalid reset token', 400));
    }

    // Check that the OTP record still exists (not yet used)
    const otpRecord = await OTP.findById(decoded.otpId);
    if (!otpRecord) {
        return next(new ErrorResponse('Reset session expired or already used. Please start again.', 400));
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
        return next(new ErrorResponse('User not found', 400));
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Cleanup the OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log(`✅ Password reset successful for ${decoded.email}`);

    res.json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' });
});

/**
 * PUT /api/auth/profile
 * Updates user profile (name and/or profile photo)
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const { name, profilePhoto } = req.body;
    if (name) {
        user.name = name;
    }
    if (profilePhoto !== undefined) {
        // profilePhoto can be a base64 data URL or null (to remove)
        user.profilePhoto = profilePhoto;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
        token: generateToken(updatedUser.id, updatedUser.role)
    });
});
