const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order.model.js');
const logger = require('../../../common/logger.js');
const AppError = require('../../../common/AppError.js');

const { sendMessage } = require('../../../common/kafkaProducer.js');

exports.createOrder = async (data) => {
  const order = await Order.create({
    order_id: uuidv4(),
    user_id: data.userId,
    amount: data.amount,
  });

  logger.info('Order created', order);

  // 2️⃣ Create event
  const event = {
    eventId: uuidv4(),
    orderId: order.id,
    userId: order.user_id,
    amount: order.amount,
    status: order.status,
    email:data.email
  };

    // 3️⃣ Send to Kafka
  try {
    await sendMessage({
      topic: 'order-created',
      key: order.id,
      value: event,
    });

    logger.info('Order event sent to Kafka', event);

  } catch (err) {
    logger.error('Kafka failed, implement outbox later', err);
  }

  return order;
};

exports.updateOrderStatus = async ({ orderId, status }) => {
  const order = await Order.findByPk(orderId);

  if (!order) {
    logger.error('Order not found', { orderId });
    throw new AppError('Order not found', 404);
  }

  // 🔥 Idempotency (VERY IMPORTANT)
  if (order.status === status) {
    logger.warn('Order already in same status', { orderId, status });
    return order;
  }

  // 🔥 Prevent invalid transitions
  if (order.status === 'SUCCESS') {
    logger.warn('Order already SUCCESS, skipping update', { orderId });
    return order;
  }

  order.status = status;
  await order.save();

  logger.info('Order status updated', {
    orderId,
    status,
  });

  return order;
};