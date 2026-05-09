// Eventora Server - Event Management System (v1.1)
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
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventora';

  // Use in-memory DB only if explicitly set in .env (USE_MEMORY_DB=true)
  if (process.env.USE_MEMORY_DB === 'true') {
    return await startInMemoryDB();
  }

  // Try connecting to Atlas / remote MongoDB
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ MongoDB Connected (Atlas)');
  } catch (err) {
    console.error('⚠️  MongoDB Atlas Connection Failed:', err.message);
    console.log('');
    console.log('   Your network may be blocking Atlas DNS queries.');
    console.log('   Falling back to local in-memory database with demo data...');
    console.log('');
    await startInMemoryDB();
  }
};

const startInMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const seedDatabase = require('./seed');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('✅ MongoDB Connected (In-Memory)');
    await seedDatabase(mongoose);
    console.log('');
    console.log('   ⚡ Using in-memory database — data will reset on server restart');
    console.log('   📌 To use Atlas: fix your network/IP whitelist and restart');
    console.log('');
  } catch (memErr) {
    console.error('❌ In-Memory MongoDB Error:', memErr.message);
    process.exit(1);
  }
};

// Start server with automatic port retry on conflict
const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`\n✅ Server running on port ${port} at http://localhost:${port}`);
    console.log(`   API available at http://localhost:${port}/api\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err.message);
    }
  });

  // Graceful shutdown on Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
      } catch (e) {
        console.error('Error closing MongoDB:', e.message);
      }
      process.exit(0);
    });
  });
};

// Prevent crash on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

connectDB().then(() => {
  const PORT = parseInt(process.env.PORT) || 5000;
  startServer(PORT);
});
