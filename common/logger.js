const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const config = require('./config');

const { combine, timestamp, printf, errors, json } = format;

// 🔥 ENV CONFIG
const SERVICE_NAME = config.serviceName;
const ENV = config.env;

// 🔥 Ensure logs folder exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 🔥 Console format
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}] [${SERVICE_NAME}]: ${message}`;

  if (Object.keys(meta).length) {
    log += ` ${JSON.stringify(meta)}`;
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

// 🔥 Add global metadata
const addMeta = format((info) => {
  info.service = SERVICE_NAME;
  info.env = ENV;
  return info;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false, // 🔥 important for graceful shutdown

  format: combine(
    timestamp(),
    errors({ stack: true }),
    addMeta(),
    json()
  ),

  transports: [
    new transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        consoleFormat
      ),
    }),

    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),

    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'info', // 🔥 FIX
    }),
  ],
});

module.exports = logger;