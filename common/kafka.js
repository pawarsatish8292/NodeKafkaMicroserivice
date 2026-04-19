const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || 'microservices-app',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
   retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

// 🔥 Producer (shared)
const producer = kafka.producer();

// 🔥 Create consumer (dynamic group)
const createConsumer = (groupId) => {
  return kafka.consumer({ groupId });
};

module.exports = {
  kafka,
  producer,
  createConsumer,
};