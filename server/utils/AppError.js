/**
 * AppError – Custom operational error class.
 *
 * OOP: Extends native Error to carry HTTP status code.
 * Controllers throw AppError; the global error handler catches it cleanly.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Unauthorized', 403);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes known errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
