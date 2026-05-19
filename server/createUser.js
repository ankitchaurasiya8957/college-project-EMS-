// Creates a verified user account directly in the database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'eventora', serverSelectionTimeoutMS: 15000 });

    const email = 'chaurasiyankit22@gmail.com';

    // Check if already exists
    const existing = await mongoose.connection.db.collection('users').findOne({ email });
    if (existing) {
      console.log('⚠️  User already exists!');
      await mongoose.disconnect();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Test@1234', salt);

    await mongoose.connection.db.collection('users').insertOne({
      name: 'Ankit Chaurasiya',
      email,
      password: hash,
      role: 'user',
      isVerified: true,
      profilePhoto: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ User created successfully!');
    console.log('   📧 Email:    chaurasiyankit22@gmail.com');
    console.log('   🔑 Password: Test@1234');
    console.log('   👤 Role:     user');
    console.log('   ✔️  Verified: true');
    console.log('\n   You can now log in with these credentials.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
