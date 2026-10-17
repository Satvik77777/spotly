import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { locationRouter } from './modules/locations/location.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess, sendError } from './utils/apiResponse.js';

export function createApp() {
  const app = express();

  // Security Middleware
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/+$/, '');
        if (
          env.NODE_ENV === 'development' ||
          env.corsOriginsList.includes('*') ||
          env.corsOriginsList.includes(normalized) ||
          env.corsOriginsList.includes(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Rate Limiting (1000 requests per 15 mins for dev/demo)
  if (env.NODE_ENV !== 'test') {
    app.use(
      '/api',
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: env.NODE_ENV === 'development' ? 1000 : 250,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          error: {
            message: 'Too many requests from this IP, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
      })
    );
  }

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health Check Endpoint
  app.get('/api/health', (_req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
    });
  });

  // REST API Module Mounts
  app.use('/api/locations', locationRouter);

  // 404 Route Handler
  app.use((req, res) => {
    sendError(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
