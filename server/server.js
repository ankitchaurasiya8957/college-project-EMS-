// Eventora Server - Event Management System
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Database Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventora';
    await mongoose.connect(uri);
    console.log('MongoDB Connected (Remote/Local)');
  } catch (err) {
    console.error('Primary MongoDB Connection Error:', err.message);
    console.log('Attempting to start local in-memory MongoDB Server as fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const seedDatabase = require('./seed');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log('MongoDB Connected (In-Memory Fallback)');
      console.log('Populating in-memory database with initial data...');
      await seedDatabase(mongoose);
    } catch (memErr) {
      console.error('In-Memory MongoDB Connection Error:', memErr.message);
    }
  }
};

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} at 0.0.0.0`));
});
