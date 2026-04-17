const logger = require('./logger');

module.exports = (server, sequelize, getActiveRequests) => {

  let isShuttingDown = false;

  const gracefulShutdown = async (signal, exitCode) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // 🛑 Stop accepting new requests
    server.close(async () => {
      logger.info('Stopped accepting new requests');

      // ⏳ Wait for active requests to finish
      const waitForRequests = async () => {
        let retries = 10;

        while (getActiveRequests() > 0 && retries > 0) {
          logger.info(`Waiting for ${getActiveRequests()} active requests...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
        }

        if (getActiveRequests() > 0) {
          logger.warn('Force shutdown with active requests still running');
        } else {
          logger.info('All requests completed');
        }
      };

      await waitForRequests();

      try {
        if (sequelize) {
          await sequelize.close();
          logger.info('DB connection closed');
        }

        logger.info('Shutdown complete');
        process.exit(exitCode);

      } catch (err) {
        logger.error('Error during shutdown', { stack: err.stack });
        process.exit(1);
      }
    });

    // ⏱️ Safety timeout
    setTimeout(() => {
      logger.error('Force shutdown due to timeout');
      process.exit(1);
    }, 15000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));
  process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));

  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION', { stack: err.stack });
    gracefulShutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION', { stack: err.stack });
    gracefulShutdown('unhandledRejection', 1);
  });
};