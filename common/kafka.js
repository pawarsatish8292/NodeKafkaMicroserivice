const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || 'microservices-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
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