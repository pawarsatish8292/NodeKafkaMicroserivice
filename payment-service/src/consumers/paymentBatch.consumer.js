const { push, size, MAX_QUEUE } = require('../utils/queue.js');
const logger = require('../../../common/logger.js');
const { createConsumer } = require('../../../common/kafka.js');

const runConsumer = async () => {
  const consumer = createConsumer('payment-group');

  await consumer.connect();

  await consumer.subscribe({
    topic: 'order-created',
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());

      // 🔥 Backpressure check
      if (size() >= MAX_QUEUE) {
        logger.warn('Queue full, pausing consumer');

        consumer.pause([{ topic: 'order-created' }]);
        return;
      }

      push(data);
    },
  });

  return consumer; // 🔥 important for worker
};

module.exports = runConsumer;