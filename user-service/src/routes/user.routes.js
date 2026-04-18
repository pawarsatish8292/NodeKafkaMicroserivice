const express = require('express');
const controller = require('../controllers/user.controller.js');
// const validate = require('../../../common/validate.middleware.js');
const internalAuth = require('../middlewares/internalAuth.middleware');
const { createUserSchema } = require('../schemas/user.schema.js');
const {
  middleware
} = require('@satish/common');

const router = express.Router();

router.post('/', internalAuth, middleware.validate(createUserSchema), controller.createUser);
router.get('/:id', internalAuth, controller.getUser);

module.exports = router;