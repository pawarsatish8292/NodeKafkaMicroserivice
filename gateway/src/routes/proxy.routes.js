const express = require('express');
const proxy = require('express-http-proxy');

const authMiddleware = require('../middlewares/auth.middleware.js');
const roleMiddleware = require('../middlewares/role.middleware.js');

const router = express.Router();

// 🔓 Public route
router.use('/auth', proxy('http://localhost:3001'));

// 🔐 Protected routes
// router.use(
//   '/users',
//   authMiddleware,
//   proxy('http://localhost:3002', {
//     parseReqBody: true, // 🔥 IMPORTANT

//     proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//       proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
//       proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
//       return proxyReqOpts;
//     },

//     proxyReqPathResolver: (req) => {
//       return req.url; // forward correctly
//     }
//   })
// );

router.use(
  '/users',
  authMiddleware,
  proxy('http://localhost:3002', {
    parseReqBody: true,

    proxyReqPathResolver: (req) => {
      // 🔥 ALWAYS forward full path
      return `/users${req.url}`;
    },

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
      return proxyReqOpts;
    }
  })
);

// 🔐 RBAC protected
router.use(
  '/orders',
  authMiddleware,
  roleMiddleware(['admin', 'user']),
  proxy('http://localhost:3003', {
    parseReqBody: true,

    proxyReqPathResolver: (req) => {
      // 🔥 ALWAYS forward full path
      return `/orders${req.url}`;
    },

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
      return proxyReqOpts;
    }
  })
);

module.exports = router;