// const { startConsumer } = require('../../../common/kafkaConsumer.js');
// const logger = require('../../../common/logger.js');

const {
  logger,
  kafka
} = require('@satish/common');
const service = require('../services/order.service.js');

// ✅ PAYMENT SUCCESS
const handleSuccess = async (data) => {
  try {
    logger.info('Payment success received', data);

    await service.updateOrderStatus({
      orderId: data.orderId,
      status: 'SUCCESS',
    });

  } catch (err) {
    logger.error('Failed to update SUCCESS', {
      error: err.message,
      data,
    });
  }
};

// ❌ PAYMENT FAILED (IMMEDIATE)
const handleFailed = async (data) => {
  try {
    logger.warn('Payment failed received', data);

    await service.updateOrderStatus({
      orderId: data.orderId,
      status: 'FAILED',
    });

  } catch (err) {
    logger.error('Failed to update FAILED', {
      error: err.message,
      data,
    });
  }
};

// ☠️ DLQ (FINAL FAILURE)
const handleDLQ = async (data) => {
  try {
    logger.error('Payment moved to DLQ', data);

    await service.updateOrderStatus({
      orderId: data.orderId,
      status: 'FAILED',
    });

  } catch (err) {
    logger.error('Failed to update from DLQ', {
      error: err.message,
      data,
    });
  }
};

// 🚀 START ALL CONSUMERS
const run = async () => {

  // ✅ SUCCESS
  await kafka.startConsumer({
    groupId: 'order-success-group',
    topic: 'payment-success',
    handler: handleSuccess,
  });

  // ❌ FAILED
  await kafka.startConsumer({
    groupId: 'order-failed-group',
    topic: 'payment-failed',
    handler: handleFailed,
  });

  // ☠️ DLQ
  await kafka.startConsumer({
    groupId: 'order-dlq-group',
    topic: 'payment-dlq',
    handler: handleDLQ,
  });
};

module.exports = run;