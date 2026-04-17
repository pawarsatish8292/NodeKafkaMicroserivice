const { producer } = require('./kafka.js');
const logger = require('./logger.js');

let isConnected = false;

const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    logger.info('Kafka Producer connected');
  }
};

const sendMessage = async ({ topic, key, value }) => {
  try {
    await connectProducer();

    await producer.send({
      topic,
      messages: [
        {
          key: key ? String(key) : null,
          value: JSON.stringify(value),
        },
      ],
    });

  } catch (err) {
    logger.error('Kafka send failed', err);
    throw err;
  }
};

module.exports = {
  sendMessage,
};