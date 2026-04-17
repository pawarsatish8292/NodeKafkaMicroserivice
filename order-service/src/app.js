require('dotenv').config();

const express = require('express');
const logger = require('../../common/logger.js');
const sequelize = require('./config/db.js');
const errorMiddleware = require('../../common/error.middleware.js');
const requestLogger = require('../../common/requestLogger.middleware.js');
const processHandlers = require('../../common/processHandlers.js');

// 🔥 Consumers
const runOrderConsumer = require('./consumers/order.consumer.js');

const app = express();

let activeRequests = 0;

app.use((req, res, next) => {
  activeRequests++;

  res.on('finish', () => {
    activeRequests--;
  });

  next();
});
app.use(requestLogger);
app.use(express.json());

// routes
const orderRoutes = require('./routes/order.routes');
app.use('/orders', orderRoutes);

// health
app.get('/health', (req, res) => {
  res.send('Order Service Running');
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3003;

let server;

// 🚀 START FUNCTION (clean bootstrap)
const start = async () => {
  try {
    logger.info('Starting Order Service...');
    // 🔥 Start server safely
    sequelize.sync().then(() => {
      logger.info('DB connected');
    });
    // 🔥 Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`Notification Service running on ${PORT}`);
    });

    // 🔥 Start Kafka consumers
    await runOrderConsumer();
    logger.info('Notification consumer started');

    // 🔥 Attach graceful shutdown
    // 🔥 Attach process handlers AFTER server starts
    processHandlers(server, sequelize, () => activeRequests);

  } catch (err) {
    logger.error('Failed to start Notification Service', err);
    process.exit(1);
  }
};

// 🚀 START APP
start();