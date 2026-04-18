module.exports = {
  // 🔥 Core
  AppError: require('./AppError.js'),
  asyncHandler: require('./asyncHandler.js'),

  // 🔥 Config & Logger
  logger: require('./logger.js'),

  // 🔥 Middlewares
  middleware: {
    error: require('./error.middleware.js'),
    requestLogger: require('./requestLogger.middleware.js'),
    validate: require('./validate.middleware.js'),
  },

  // 🔥 Process
  processHandlers: require('./processHandlers.js'),

  // 🔥 HTTP
  http: {
    callService: require('./httpClient.js').callService,
  },

  // 🔥 Kafka
  kafka: {
    sendMessage: require('./kafkaProducer.js').sendMessage,
    startConsumer: require('./kafkaConsumer.js').startConsumer,
  },
};