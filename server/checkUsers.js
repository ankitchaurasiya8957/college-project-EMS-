const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({}, 'email name isVerified');
        console.log('--- ALL REGISTERED USERS ---');
        users.forEach(u => {
            console.log(`- ${u.name} | ${u.email} | Verified: ${u.isVerified}`);
        });
        console.log('----------------------------');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
