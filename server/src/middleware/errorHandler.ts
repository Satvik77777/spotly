import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

interface AppError extends Error {
  statusCode?: number;
  path?: string;
  errors?: Record<string, { path: string; message: string }>;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled Application Error:', err);

  // Mongoose CastError (e.g. malformed ObjectId passed directly)
  if (err.name === 'CastError') {
    sendError(res, `Invalid value for ${err.path || 'parameter'}`, 400, 'INVALID_PARAMETER');
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Database validation failed', 400, 'VALIDATION_ERROR', details);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const details = env.NODE_ENV === 'development' ? err.stack : undefined;

  sendError(res, message, statusCode, 'INTERNAL_SERVER_ERROR', details);
}
