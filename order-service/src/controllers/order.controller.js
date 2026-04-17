const service = require('../services/order.service.js');

exports.createOrder = async (req, res) => {
  const result = await service.createOrder(req.body);

  res.json({
    status: 'success',
    data: result,
  });
};