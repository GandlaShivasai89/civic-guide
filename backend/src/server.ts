import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { DatabaseAdapter } from './utils/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/api/health')) {
      console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CivicGuide AI API',
    database: DatabaseAdapter.isPostgres() ? 'PostgreSQL' : 'Relational Engine (Active)',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend assets if built
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await DatabaseAdapter.init();
    app.listen(PORT, () => {
      console.log(`\n=============================================================`);
      console.log(`🏛️  CivicGuide AI - Government Process Assistant API Server`);
      console.log(`📡  Listening on: http://localhost:${PORT}`);
      console.log(`🛡️  Database: ${DatabaseAdapter.isPostgres() ? 'PostgreSQL' : 'Embedded Relational Engine'}`);
      console.log(`🚀  Health check: http://localhost:${PORT}/api/health`);
      console.log(`=============================================================\n`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start server', err);
    process.exit(1);
  }
}

startServer();
