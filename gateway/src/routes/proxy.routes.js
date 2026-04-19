const express = require('express');
const proxy = require('express-http-proxy');

const authMiddleware = require('../middlewares/auth.middleware.js');
const roleMiddleware = require('../middlewares/role.middleware.js');

const router = express.Router();

// 🔓 Public route
router.use('/auth', proxy(process.env.AUTH_SERVICE_URL));

router.use(
  '/users',
  authMiddleware,
  proxy(process.env.USER_SERVICE_URL, {
    parseReqBody: true,
    proxyReqPathResolver: (req) => `/users${req.url}`,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
      return proxyReqOpts;
    }
  })
);

router.use(
  '/orders',
  authMiddleware,
  roleMiddleware(['admin', 'user']),
  proxy(process.env.ORDER_SERVICE_URL, {
    parseReqBody: true,
    proxyReqPathResolver: (req) => `/orders${req.url}`,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
      return proxyReqOpts;
    }
  })
);

module.exports = router;