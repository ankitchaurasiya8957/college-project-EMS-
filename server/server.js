// Eventora Server - Event Management System (v2.0)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const dotenv = require('dotenv');

dotenv.config();

// ── Fix DNS: Use trusted public resolvers for MongoDB Atlas SRV lookups ──
// Google Public DNS (8.8.8.8) + Cloudflare DNS (1.1.1.1) — real, production DNS resolvers
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

// ── Health Check ──
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    database: states[mongoose.connection.readyState] || 'unknown',
    dbName: mongoose.connection.db?.databaseName || 'none',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString()
  });
});

// ── Database Connection ──
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventora';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log('✅ MongoDB Connected (Atlas)');
    return;
  } catch (err) {
    console.warn('⚠️  Atlas connection failed:', err.message);
  }

  // Fallback: In-memory database with seeded demo data
  console.log('   Starting in-memory MongoDB fallback...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('✅ MongoDB Connected (In-Memory)');
    await require('./seed')(mongoose);
    console.log('   ⚡ Data resets on restart | Fix network to use Atlas');
  } catch (memErr) {
    console.error('❌ All database connections failed:', memErr.message);
    process.exit(1);
  }
};

// ── Start Server ──
const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`\n✅ Server running at http://localhost:${port}`);
    console.log(`   API: http://localhost:${port}/api\n`);
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
