import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import validateEnv from './config/env';
import db from './config/db';
import errorHandler from './middleware/errorHandler';

// Validate env vars before anything else
validateEnv();

// Route imports
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import internshipRoutes from './routes/internshipRoutes';
import focusRoutes from './routes/focusRoutes';
import githubRoutes from './routes/githubRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
// Project management
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import cycleRoutes from './routes/cycleRoutes';

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// General API limiter – 100 requests per 15 mins per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Stricter limiter for auth routes – 10 attempts per 15 mins (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight
app.options('*', cors());

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));   // reject payloads > 10kb
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/habits',       apiLimiter,  habitRoutes);
app.use('/api/internships',  apiLimiter,  internshipRoutes);
app.use('/api/focus',        apiLimiter,  focusRoutes);
app.use('/api/github',       apiLimiter,  githubRoutes);
app.use('/api/dashboard',    apiLimiter,  dashboardRoutes);
// Project management routes
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/tasks',    apiLimiter, taskRoutes);
app.use('/api/projects/:projectId/cycles', apiLimiter, cycleRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevTrack API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const start = async () => {
  await db.connect();
  app.listen(PORT, () => {
    console.log(`\n🚀 DevTrack API  →  http://localhost:${PORT}/api`);
    console.log(`   Environment  →  ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Rate limit   →  100 req/15min (10 on auth)\n`);
  });
};

start();

export default app;
