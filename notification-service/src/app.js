require('dotenv').config();

const express = require('express');
// const logger = require('../../common/logger.js');

const {
  processHandlers,
  logger,
} = require('@satish/common');

// 🔥 Consumers
const runNotificationConsumer = require('./consumers/notification.consumer.js');

// 🔥 Graceful shutdown (reuse common)
// const processHandlers = require('../../common/processHandlers.js');

const app = express();

app.use(express.json());

// 🔥 Health check (Kubernetes / monitoring)
app.get('/health', (req, res) => {
  res.send('Notification Service Running');
});

const PORT = process.env.PORT || 3005;

let server;

// 🚀 START FUNCTION (clean bootstrap)
const start = async () => {
  try {
    logger.info('Starting Notification Service...');

    // 🔥 Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`Notification Service running on ${PORT}`);
    });

    // 🔥 Start Kafka consumers
    await runNotificationConsumer();
    logger.info('Notification consumer started');

    // 🔥 Attach graceful shutdown
    processHandlers(server, null, () => 0);

  } catch (err) {
    logger.error('Failed to start Notification Service', err);
    process.exit(1);
  }
};

// 🚀 START APP
start();