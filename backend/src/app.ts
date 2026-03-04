// ============================================
// Express App Initialization
// ============================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route Imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import classRoutes from './modules/classes/class.routes';
import assignmentRoutes from './modules/assignments/assignment.routes';
import submissionRoutes from './modules/submissions/submission.routes';
import gradeRoutes from './modules/grades/grade.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Rate Limiting (100 requests per 15 minutes per IP)
// Disabled in test environment so the test suite can run all repeats without 429s
if (env.NODE_ENV !== 'test') {
    const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
    app.use('/api', limiter);
}

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (suppress in test to keep output clean)
if (env.isDev && env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Health Check
app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'OK', timestamp: new Date(), uptime: process.uptime() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
