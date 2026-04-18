const { producer } = require('./kafka.js');
const logger = require('./logger.js');

let isConnected = false;

const connectProducer = async () => {
  let retries = 10;

  while (retries) {
    try {
      await producer.connect();
      isConnected = true;
      logger.info('✅ Kafka Producer connected');
      break;
    } catch (err) {
      logger.error('Kafka connection failed, retrying...', err);
      retries--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

const sendMessage = async ({ topic, key, value }) => {
  if (!isConnected) {
    await connectProducer();
  }

  await producer.send({
    topic,
    messages: [
      {
        key: String(key),
        value: JSON.stringify(value),
      },
    ],
  });
};

module.exports = {
  sendMessage,  // ✅ VERY IMPORTANT
};