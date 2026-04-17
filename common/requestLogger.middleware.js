const logger = require('./logger');

module.exports = (req, res, next) => {
  const start = Date.now();

  // 👉 after response finished
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('Incoming Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId, // if added later
    });
  });

  next();
};