const { producer } = require('./kafka.js');
const logger = require('./logger.js');

let isConnected = false;
let isConnecting = false;

const connectProducer = async () => {
  if (isConnected || isConnecting) return;
  let retries = 10;
  isConnecting = true; 
  while (retries) {
    try {
      await producer.connect();
      isConnected = true;
      isConnecting = false;
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
try {
  await producer.send({
    topic,
    messages: [
      {
        key: String(key),
        value: JSON.stringify(value),
      },
    ],
  });
   logger.info('📤 Kafka message sent', { topic, key });
  } catch (err) {
  logger.error('Kafka failed (use outbox later)', err);
}
};

module.exports = {
  sendMessage,  // ✅ VERY IMPORTANT
};