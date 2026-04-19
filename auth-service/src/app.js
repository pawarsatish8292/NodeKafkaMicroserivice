require('dotenv').config(); 
// WHY: Load environment variables securely

const express = require('express');
const sequelize = require('./config/db.js');

const {
  middleware,
  processHandlers,
  logger,
  http,
  AppError,
  asyncHandler,
  httpClient
} = require('@satish/common');

const app = express();

app.use(middleware.requestLogger);
app.use(express.json());
// WHY: Parse incoming JSON body

console.log('SERVICE_NAME:', process.env.SERVICE_NAME);

const authRoutes = require('./routes/auth.routes.js');

let activeRequests = 0;

app.use((req, res, next) => {
  activeRequests++;

  res.on('finish', () => {
    activeRequests--;
  });

  next();
});

app.use('/', authRoutes);

app.get('/health', (req, res) => {
  res.send('Auth Service Running');
});
// WHY: Health check for Kubernetes / monitoring

app.use(middleware.error);

const PORT = process.env.PORT || 3001;

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