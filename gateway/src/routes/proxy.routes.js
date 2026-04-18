const express = require('express');
const proxy = require('express-http-proxy');

const authMiddleware = require('../middlewares/auth.middleware.js');
const roleMiddleware = require('../middlewares/role.middleware.js');

const router = express.Router();

// // 🔓 Public route
// router.use('/auth', proxy('http://localhost:3001'));

// router.use(
//   '/users',
//   authMiddleware,
//   proxy('http://localhost:3002', {
//     parseReqBody: true,

//     proxyReqPathResolver: (req) => {
//       // 🔥 ALWAYS forward full path
//       return `/users${req.url}`;
//     },

//     proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//       proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
//       proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
//       return proxyReqOpts;
//     }
//   })
// );

// // 🔐 RBAC protected
// router.use(
//   '/orders',
//   authMiddleware,
//   roleMiddleware(['admin', 'user']),
//   proxy('http://localhost:3003', {
//     parseReqBody: true,

//     proxyReqPathResolver: (req) => {
//       // 🔥 ALWAYS forward full path
//       return `/orders${req.url}`;
//     },

//     proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//       proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
//       proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
//       return proxyReqOpts;
//     }
//   })
// );

// module.exports = router;


// 🔓 Public route
router.use('/auth', proxy('http://auth-service:3000'));

router.use(
  '/users',
  authMiddleware,
  proxy('http://user-service:3000', {
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
  proxy('http://order-service:3000', {
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