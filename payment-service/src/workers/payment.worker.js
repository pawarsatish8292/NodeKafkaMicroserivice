const { popBatch, size } = require('../utils/queue.js');
const logger = require('../../../common/logger.js');
const { sendMessage } = require('../../../common/kafkaProducer.js');

// 🔥 Simulate payment logic
const processPayment = async (data) => {
  // simulate random failure
  if (Math.random() < 0.5) {
    throw new Error('Payment failed');
  }
  return true;
};


const processBatch = async () => {
  const batch = popBatch(50);

  for (const data of batch) {
    try {
      // simulate processing
      await processPayment(data);

      await sendMessage({
        topic: 'payment-success',
        key: data.orderId,
        value: data,
      });
  logger.info('Payment success', data);
    } catch (err) {
  logger.error('Payment unsuccess', err);
      // retry logic here
    }
  }
};

const startWorker = (consumer) => {
  setInterval(async () => {
    await processBatch();

    // 🔥 Resume if queue reduced
    if (size() < 5000) {
      consumer.resume([{ topic: 'order-created' }]);
    }

  }, 1000);
};

module.exports = startWorker;