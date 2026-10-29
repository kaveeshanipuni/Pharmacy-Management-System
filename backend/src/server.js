require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  // Start HTTP server so API endpoints and dev proxy remain operational
  server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Pharmacy Management API Server Running!`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  const tryConnectDB = async () => {
    try {
      await connectDB();
    } catch (error) {
      console.warn(`[Database] MongoDB connection failed: ${error.message}`);
      console.warn(`[Database] If using MongoDB Atlas, check that your IP is in Network Access whitelist.`);
      console.log(`[Database] Will retry connection in 10 seconds...`);
      setTimeout(tryConnectDB, 10000);
    }
  };

  tryConnectDB();
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Database connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
