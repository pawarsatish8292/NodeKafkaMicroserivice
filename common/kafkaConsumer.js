const { createConsumer } = require('./kafka.js');
const logger = require('./logger.js');

// const startConsumer = async ({ groupId, topic, handler }) => {
//   const consumer = createConsumer(groupId);

//   await consumer.connect();

//   await consumer.subscribe({
//     topic,
//     fromBeginning: false,
//   });

//   await consumer.run({
//     eachMessage: async ({ message, partition }) => {
//       try {
//         const data = JSON.parse(message.value.toString());

//         logger.info('Message received', { topic, partition });

//         await handler(data);

//       } catch (err) {
//         logger.error('Consumer error', err);
//         // 👉 later: retry + DLQ
//       }
//     },
//   });
// };

const startConsumer = async ({ groupId, topic, handler }) => {
  const consumer = createConsumer(groupId);

  let retries = 10;

  while (retries) {
    try {
      await consumer.connect();
      logger.info('✅ Kafka Consumer connected');
      break;
    } catch (err) {
      logger.error('❌ Kafka not ready, retrying...', err);
      retries--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }

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
      }
    },
  });
};

module.exports = {
  startConsumer,
};