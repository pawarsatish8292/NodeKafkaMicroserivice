if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const proxyRoutes = require('./routes/proxy.routes.js');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// const requestLogger = require('../../common/requestLogger.middleware.js');
const {
  middleware,
  logger
} = require('@satish/common');

const app = express();

// 🔐 1. Secure headers
app.use(helmet());
app.use(middleware.requestLogger);
// WHY: prevents XSS, clickjacking, MIME sniffing

// 🌍 2. CORS config
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// WHY: prevent unauthorized domains

// 🚫 3. Rate limiting
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100
}));
// WHY: prevent brute force / DDoS

// 📦 4. Body parser
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`[Gateway] ${req.method} ${req.url}`);
  next();
});

app.use('/', proxyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.send('Gateway running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Gateway running on ${PORT}`);
});