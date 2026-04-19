require('dotenv').config();

const express = require('express');
const sequelize = require('./config/db.js');

// const logger = require('../../common/logger');
// const errorMiddleware = require('../../common/error.middleware');
// const processHandlers = require('../../common/processHandlers.js');
// const requestLogger = require('../../common/requestLogger.middleware');

const {
  middleware,
  processHandlers,
  logger
} = require('@satish/common');

const app = express();

app.use(middleware.requestLogger);
app.use(express.json());

// routes
const userRoutes = require('./routes/user.routes');

let activeRequests = 0;

app.use((req, res, next) => {
  activeRequests++;

  res.on('finish', () => {
    activeRequests--;
  });

  next();
});

app.use('/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.send('user service running');
});

// error handler
app.use(middleware.error);

const PORT = process.env.PORT || 3002;

let server;

// 🔥 Start server safely
sequelize.sync().then(() => {
  logger.info('DB connected');

  server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });

  // 🔥 Attach process handlers AFTER server starts
  processHandlers(server, sequelize, () => activeRequests);

}).catch((err) => {
  console.error('DB connection failed', err);
});