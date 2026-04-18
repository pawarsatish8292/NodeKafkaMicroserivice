require('dotenv').config();

const express = require('express');
// const logger = require('../../common/logger.js');

const {
  logger
} = require('@satish/common');

const runPaymentConsumer = require('./consumers/payment.consumer.js');

const startWorker = require('./workers/payment.worker.js');
const runConsumer = require('./consumers/paymentBatch.consumer.js');

const app = express();
// let consumer;

app.get('/health', (req, res) => {
  res.send('Payment Service Running');
});

// const start = async () => {
//  consumer = await runConsumer();

//   startWorker(consumer); // 🔥 connect worker + consumer
// };

const PORT = process.env.PORT || 3004;

app.listen(PORT, async() => {
  logger.info(`Payment Service running on ${PORT}`);

   // 🔥 START KAFKA CONSUMER
  try {
    await runPaymentConsumer();
   // await start();
    logger.info('Kafka consumer started');
  } catch (err) {
    logger.error('Failed to start Kafka consumer', err);
  }

});