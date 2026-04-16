/**
 * asyncHandler – Higher-order function wrapping async route handlers.
 *
 * Eliminates repetitive try/catch in every controller method.
 * Any thrown error (including AppError) is forwarded to Express's
 * global error handler via next(err).
 *
 * Usage:
 *   router.get('/me', protect, asyncHandler(AuthController.getMe));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
