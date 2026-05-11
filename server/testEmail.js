/**
 * testEmail.js — Quick test to diagnose email sending issues.
 * Run: node testEmail.js
 */
const nodemailer = require('nodemailer');
const dns = require('dns');
const dotenv = require('dotenv');

dotenv.config();

// Same DNS fix as server.js
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('📧 Testing email configuration...');
console.log('   EMAIL_USER:', EMAIL_USER);
console.log('   EMAIL_PASS:', EMAIL_PASS ? `${EMAIL_PASS.substring(0, 4)}****` : '(not set)');
console.log('   PASS length:', EMAIL_PASS?.length || 0);
console.log('');

async function testEmail() {
    // Test 1: Try port 587 (STARTTLS)
    console.log('🔄 Test 1: Trying smtp.gmail.com:587 (STARTTLS)...');
    try {
        const t1 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
            connectionTimeout: 15000,
            tls: { rejectUnauthorized: false }
        });
        await t1.verify();
        console.log('   ✅ Port 587 works! Sending test email...');
        await t1.sendMail({
            from: EMAIL_USER,
            to: EMAIL_USER,  // Send to yourself
            subject: 'Eventora Test Email',
            html: '<h2>It works!</h2><p>Email sending is configured correctly.</p>'
        });
        console.log('   ✅ Test email sent to', EMAIL_USER);
        t1.close();
        return;
    } catch (err) {
        console.log('   ❌ Port 587 failed:', err.message);
        console.log('   Error code:', err.code || 'none');
    }

    // Test 2: Try port 465 (SSL)
    console.log('\n🔄 Test 2: Trying smtp.gmail.com:465 (SSL)...');
    try {
        const t2 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
            connectionTimeout: 15000,
            tls: { rejectUnauthorized: false }
        });
        await t2.verify();
        console.log('   ✅ Port 465 works! Sending test email...');
        await t2.sendMail({
            from: EMAIL_USER,
            to: EMAIL_USER,
            subject: 'Eventora Test Email',
            html: '<h2>It works!</h2><p>Email sending is configured correctly on port 465.</p>'
        });
        console.log('   ✅ Test email sent to', EMAIL_USER);
        console.log('\n⚠️  Port 465 works but 587 does not!');
        console.log('   → Update email.js to use port 465 + secure: true');
        t2.close();
        return;
    } catch (err) {
        console.log('   ❌ Port 465 failed:', err.message);
        console.log('   Error code:', err.code || 'none');
    }

    // Test 3: Try service: 'gmail' shortcut
    console.log('\n🔄 Test 3: Trying service: "gmail"...');
    try {
        const t3 = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
            connectionTimeout: 15000,
            tls: { rejectUnauthorized: false }
        });
        await t3.verify();
        console.log('   ✅ Service "gmail" works!');
        t3.close();
        return;
    } catch (err) {
        console.log('   ❌ Service "gmail" failed:', err.message);
        console.log('   Error code:', err.code || 'none');
    }

    console.log('\n❌ ALL METHODS FAILED. Possible causes:');
    console.log('   1. App Password is invalid — regenerate at https://myaccount.google.com/apppasswords');
    console.log('   2. 2-Step Verification is NOT enabled on the Gmail account');
    console.log('   3. Your network/firewall is blocking outgoing SMTP (ports 587/465)');
    console.log('   4. Try from a different network (hotspot instead of WiFi)');
}

testEmail().then(() => process.exit(0)).catch(() => process.exit(1));
