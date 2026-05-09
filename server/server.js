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

// Health check endpoint — reports DB connection status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    database: states[dbState] || 'unknown',
    dbName: mongoose.connection.db?.databaseName || 'none',
    timestamp: new Date().toISOString()
  });
});

// Database Connection
const connectDB = async () => {
  const configuredUri = process.env.MONGO_URI;

  if (!configuredUri) {
    console.warn('\n⚠️  WARNING: MONGO_URI is not set in .env file!');
    console.warn('   Trying local MongoDB at mongodb://localhost:27017/eventora ...\n');
  }

  try {
    const uri = configuredUri || 'mongodb://localhost:27017/eventora';
    await mongoose.connect(uri);
    console.log(`\n✅ MongoDB Connected Successfully`);
    console.log(`   Mode: ${configuredUri ? 'Remote (Atlas/Cloud)' : 'Local (localhost)'}`);
    console.log(`   Database: ${mongoose.connection.db.databaseName}\n`);
  } catch (err) {
    console.error('\n❌ Primary MongoDB Connection Error:', err.message);
    console.log('   Attempting to start local in-memory MongoDB Server as fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const seedDatabase = require('./seed');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.warn('\n' + '='.repeat(70));
      console.warn('  ⚠️  RUNNING WITH IN-MEMORY DATABASE — DATA WILL NOT PERSIST!');
      console.warn('  Events, users, and bookings will be LOST when the server stops.');
      console.warn('  Set MONGO_URI in server/.env to use a real MongoDB instance.');
      console.warn('='.repeat(70) + '\n');
      console.log('   Populating in-memory database with sample data...');
      await seedDatabase(mongoose);
    } catch (memErr) {
      console.error('❌ In-Memory MongoDB Connection Error:', memErr.message);
      console.error('   The server will start but NO database operations will work!');
    }
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
