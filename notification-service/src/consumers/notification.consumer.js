// const { startConsumer } = require('../../../common/kafkaConsumer.js');
// const { sendMessage } = require('../../../common/kafkaProducer.js');
const sendEmail = require('../utils/email.js');
// const logger = require('../../../common/logger.js');


const {
  logger,
  kafka
} = require('@satish/common');

const { isProcessed, markProcessed } = require('../utils/idempotency.js');

const MAX_RETRY = 3;
const BASE_DELAY = 5000; // 5 sec

// 🔥 exponential backoff
const getDelay = (retryCount) => {
  return BASE_DELAY * Math.pow(2, retryCount); 
  // 5s → 10s → 20s
};

const handleNotification = async (data) => {
  try {
    // ✅ IDEMPOTENCY CHECK
    if (isProcessed(data.eventId)) {
      logger.warn('Duplicate email skipped', { eventId: data.eventId });
      return;
    }

    // 🔥 SEND EMAIL
    await sendEmail({
      to: data.email,
      subject: 'Payment Success',
      text: `Payment of ₹${data.amount} successful`,
    });

    markProcessed(data.eventId);

    logger.info('Email sent', {
      orderId: data.orderId,
      email: data.email,
    });

  } catch (err) {
    const retryCount = data.retryCount || 0;

    logger.error('Email failed', {
      retryCount,
      error: err.message,
      orderId: data.orderId,
    });

    if (retryCount < MAX_RETRY) {
      const delay = getDelay(retryCount);

      logger.warn(`Retry after ${delay} ms`, {
        orderId: data.orderId,
      });

      // 🔥 DELAY (simple version)
      await new Promise(res => setTimeout(res, delay));

      await kafka.sendMessage({
        topic: 'notification-retry',
        key: data.orderId,
        value: {
          ...data,
          retryCount: retryCount + 1,
        },
      });

    } else {
      // ☠️ DLQ
      await kafka.sendMessage({
        topic: 'notification-dlq',
        key: data.orderId,
        value: data,
      });

      logger.error('Moved to DLQ', {
        orderId: data.orderId,
      });
    }
  }
};

// 🚀 START CONSUMERS
const run = async () => {

  // 🔥 MAIN
  await kafka.startConsumer({
    groupId: 'notification-group',
    topic: 'payment-success',
    handler: handleNotification,
  });

  // 🔁 RETRY
  await kafka.startConsumer({
    groupId: 'notification-retry-group',
    topic: 'notification-retry',
    handler: handleNotification,
  });
};

module.exports = run;