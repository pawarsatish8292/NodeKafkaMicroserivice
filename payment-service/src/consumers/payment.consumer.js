// const { startConsumer } = require('../../../common/kafkaConsumer.js');
// const { sendMessage } = require('../../../common/kafkaProducer.js');
// const logger = require('../../../common/logger.js');

const {
  logger,
  kafka
} = require('@satish/common');

const MAX_RETRY = 3;

// 🔥 Simulate payment logic
const processPayment = async (data) => {
  // simulate random failure
  if (Math.random() < 0.5) {
    throw new Error('Payment failed');
  }
 return true;
};

// 🔥 Main handler
const handlePayment = async (data) => {
  try {
    await processPayment(data);

    // ✅ Success → publish success event
    await kafka.sendMessage({
      topic: 'payment-success',
      key: data.orderId,
      value: data,
    });
    console.log(`Payment success kafka send : ${data.orderId}`)
    logger.info('Payment success', data);

  } catch (err) {
    const retryCount = data.retryCount || 0;
    console.log('Payment failed', { retryCount, error: err.message })
    logger.error('Payment failed', { retryCount, error: err.message });

    if (retryCount < MAX_RETRY) {
      // 🔁 Send to retry topic
      await kafka.sendMessage({
        topic: 'payment-retry',
        key: data.orderId,
        value: {
          ...data,
          retryCount: retryCount + 1,
        },
      });
      console.log('Payment failed payment-retry : ', retryCount, data)

    } else {
      // ☠️ Send to DLQ
      await kafka.sendMessage({
        topic: 'payment-dlq',
        key: data.orderId,
        value: data,
      });
      console.log('Payment failed Moved to DLQ', data)
      logger.error('Moved to DLQ', data);
    }
  }
};

// 🚀 Start consumers
const run = async () => {
  console.log(`startConsumer =======`);
  // Main topic
  await kafka.startConsumer({
    groupId: 'payment-group',
    topic: 'order-created',
    handler: handlePayment,
  });

  // Retry topic
  await kafka.startConsumer({
    groupId: 'payment-retry-group',
    topic: 'payment-retry',
    handler: handlePayment,
  });
   console.log(`end =======`);
};

module.exports = run;