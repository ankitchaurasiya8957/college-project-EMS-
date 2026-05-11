// Eventora Server - Event Management System (v2.0)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

// ── DNS Fix for MongoDB Atlas SRV resolution ──
// Some ISPs/networks block SRV lookups; override with public DNS
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// ── App Setup ──
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));

// ── Global Error Handler (must be AFTER all routes) ──
app.use(errorHandler);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    database: states[mongoose.connection.readyState] || 'unknown',
    dbName: mongoose.connection.db?.databaseName || 'none',
    dbHost: mongoose.connection.host || 'none',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString()
  });
});

// ── Database Connection ──
const connectDB = async () => {
  let uri = (process.env.MONGO_URI || '').trim();

  if (!uri) {
    console.error('❌ MONGO_URI is not set in .env file!');
    console.log('   Please add your MongoDB connection string to server/.env');
    console.log('   Example: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventora');
    process.exit(1);
  }

  // ── Ensure Atlas connection string has required query params ──
  if (uri.includes('mongodb+srv://') || uri.includes('mongodb.net')) {
    // Parse existing query params
    const hasParams = uri.includes('?');
    const separator = hasParams ? '&' : '?';
    const paramsToAdd = [];

    if (!uri.includes('retryWrites')) {
      paramsToAdd.push('retryWrites=true');
    }
    if (!uri.includes('w=')) {
      paramsToAdd.push('w=majority');
    }

    if (paramsToAdd.length > 0) {
      uri = uri + separator + paramsToAdd.join('&');
    }
  }

  console.log('🔗 Connecting to MongoDB...');
  console.log(`   URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`); // mask password

  try {
    await mongoose.connect(uri, {
      dbName: 'eventora',                // Explicitly target the 'eventora' database
      serverSelectionTimeoutMS: 30000,    // Wait up to 30s for server selection
      connectTimeoutMS: 30000,            // Wait up to 30s for initial connection
      socketTimeoutMS: 45000,             // Close sockets after 45s of inactivity
      heartbeatFrequencyMS: 10000,        // Check server health every 10s
      retryReads: true,
      retryWrites: true,
    });

    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    const host = mongoose.connection.host || 'unknown';
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Database: ${dbName}`);
    console.log(`   Host: ${host}`);

  } catch (err) {
    console.error('❌ MongoDB Connection FAILED!');
    console.error(`   Error: ${err.message}`);
    console.error('');
    console.error('   🔧 Troubleshooting:');
    console.error('   1. Check your MONGO_URI in server/.env');
    console.error('   2. Ensure your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.error('   3. Check your MongoDB Atlas username/password');
    console.error('   4. Make sure your internet connection is active');
    console.error('   5. Try accessing https://cloud.mongodb.com to verify Atlas is up');
    console.error('');

    // Fallback: In-memory database with seeded demo data
    console.log('   ⚠️  Attempting in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri(), { dbName: 'eventora' });
      console.log('✅ MongoDB Connected (In-Memory Fallback)');
      await require('./seed')(mongoose);
      console.log('   ⚡ WARNING: Data resets on every restart!');
      console.log('   ⚡ Fix your MONGO_URI to use persistent Atlas storage.');
    } catch (memErr) {
      console.error('❌ All database connections failed:', memErr.message);
      process.exit(1);
    }
  }

  // ── Connection event monitoring ──
  mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected! Mongoose will attempt to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully');
  });
};

// ── Start Server ──
const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`\n✅ Server running at http://localhost:${port}`);
    console.log(`   API: http://localhost:${port}/api`);
    console.log(`   Health: http://localhost:${port}/api/health\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err.message);
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Shutting down...');
    server.close(async () => {
      await mongoose.connection.close().catch(() => {});
      process.exit(0);
    });
    // Force exit after 5s if graceful shutdown hangs
    setTimeout(() => process.exit(1), 5000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

// ── Error Safety ──
process.on('uncaughtException', (err) => console.error('❌ Uncaught:', err.message));
process.on('unhandledRejection', (reason) => console.error('❌ Unhandled:', reason));

// ── Boot ──
connectDB().then(() => {
  startServer(parseInt(process.env.PORT) || 5000);
});
