const { startConsumer } = require('../../../common/kafkaConsumer.js');
const { sendMessage } = require('../../../common/kafkaProducer.js');
const logger = require('../../../common/logger.js');

const MAX_RETRY = 3;

// 🔥 Simulate payment logic
const processPayment = async (data) => {
  // simulate random failure
  if (Math.random() < 0.5) {
    throw new Error('Payment failed');
  }
 // return true;
};

// 🔥 Main handler
const handlePayment = async (data) => {
  try {
    await processPayment(data);

    // ✅ Success → publish success event
    await sendMessage({
      topic: 'payment-success',
      key: data.orderId,
      value: data,
    });
    logger.info('Payment success', data);

  } catch (err) {
    const retryCount = data.retryCount || 0;

    logger.error('Payment failed', { retryCount, error: err.message });

    if (retryCount < MAX_RETRY) {
      // 🔁 Send to retry topic
      await sendMessage({
        topic: 'payment-retry',
        key: data.orderId,
        value: {
          ...data,
          retryCount: retryCount + 1,
        },
      });

    } else {
      // ☠️ Send to DLQ
      await sendMessage({
        topic: 'payment-dlq',
        key: data.orderId,
        value: data,
      });

      logger.error('Moved to DLQ', data);
    }
  }
};

// 🚀 Start consumers
const run = async () => {

  // Main topic
  await startConsumer({
    groupId: 'payment-group',
    topic: 'order-created',
    handler: handlePayment,
  });

  // Retry topic
  await startConsumer({
    groupId: 'payment-retry-group',
    topic: 'payment-retry',
    handler: handlePayment,
  });
};

module.exports = run;