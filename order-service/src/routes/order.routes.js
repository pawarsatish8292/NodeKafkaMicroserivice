const express = require('express');
const controller = require('../controllers/order.controller.js');
// const validate = require('../../../common/validate.middleware.js')

const {
  middleware
} = require('@satish/common');

const { createOrderSchema } = require('../schemas/order.schema');

const router = express.Router();

router.post('/', middleware.validate(createOrderSchema), controller.createOrder);

module.exports = router;