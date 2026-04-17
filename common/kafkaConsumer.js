const { createConsumer } = require('./kafka.js');
const logger = require('./logger.js');

const startConsumer = async ({ groupId, topic, handler }) => {
  const consumer = createConsumer(groupId);

  await consumer.connect();

  await consumer.subscribe({
    topic,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message, partition }) => {
      try {
        const data = JSON.parse(message.value.toString());

        logger.info('Message received', { topic, partition });

        await handler(data);

      } catch (err) {
        logger.error('Consumer error', err);
        // 👉 later: retry + DLQ
      }
    },
  });
};

module.exports = {
  startConsumer,
};