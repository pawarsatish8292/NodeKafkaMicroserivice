const logger = require('./logger');

module.exports = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // 🔥 Correct structured logging
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 🔥 Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'User already exists';
  }

  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  // 🔥 JWT errors (for gateway/auth reuse)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // 🔥 Custom operational error check
  if (!err.isOperational) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(isDev && { stack: err.stack }),
  });
};