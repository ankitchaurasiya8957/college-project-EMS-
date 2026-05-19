// Quick script to check what users exist in the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'eventora',
      serverSelectionTimeoutMS: 15000
    });
    console.log('✅ Connected to MongoDB');

    const users = await mongoose.connection.db.collection('users').find(
      {},
      { projection: { name: 1, email: 1, role: 1, isVerified: 1 } }
    ).toArray();

    if (users.length === 0) {
      console.log('\n⚠️  No users found in the database!');
      console.log('   You need to REGISTER first before logging in.');
    } else {
      console.log(`\nFound ${users.length} user(s):\n`);
      users.forEach(u => {
        console.log(`  📧 ${u.email} | Name: ${u.name} | Role: ${u.role} | Verified: ${u.isVerified}`);
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
}

main();
