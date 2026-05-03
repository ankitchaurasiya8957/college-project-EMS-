const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
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
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email, action: 'account_verification' }); // Remove any old OTP
        await OTP.create({ email, otp, action: 'account_verification' });

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
            const otp = generateOTP();
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');

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

        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

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

        const otp = generateOTP();
        await OTP.findOneAndDelete({ email, action: 'account_verification' });
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        console.log(`🔄 OTP resent for ${email}`);

        res.json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        console.error('❌ Resend OTP error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
