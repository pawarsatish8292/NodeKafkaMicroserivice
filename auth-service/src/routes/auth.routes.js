const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller.js');
const validateMiddleware = require('../middlewares/validate.middleware.js');

router.post('/register', validateMiddleware, controller.register);
router.post('/login', validateMiddleware, controller.login);

module.exports = router;