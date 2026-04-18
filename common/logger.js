const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('./config');

const { combine, timestamp, printf, errors, json } = format;

// 🔥 Ensure logs folder exists (per service)
const logDir = path.join(process.cwd(), 'logs', config.serviceName);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🔥 Console format (human readable)
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let msg = typeof message === 'object'
    ? JSON.stringify(message)
    : message;

  let log = `${timestamp} [${level}] [${config.serviceName}]: ${msg}`;

  if (Object.keys(meta).length) {
    log += ` ${JSON.stringify(meta)}`;
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

// 🔥 Add metadata (for Loki / ELK)
const addMeta = format((info) => {
  info.service = config.serviceName;
  info.env = config.env;
  return info;
});

const logger = createLogger({
  level: config.logLevel,
  exitOnError: false,

  format: combine(
    timestamp(),
    errors({ stack: true }),
    addMeta(),
    json()
  ),

  transports: [
    // 🔥 Console (dev)
    new transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        consoleFormat
      ),
    }),

    // 🔥 INFO logs (rotated daily)
    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',     // 🔥 rotate if >20MB
      maxFiles: '14d',    // 🔥 keep 14 days
      zippedArchive: true // 🔥 compress old logs
    }),

    // 🔥 ERROR logs (separate file)
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
  ],
});

module.exports = logger;