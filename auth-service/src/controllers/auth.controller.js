const service = require('../services/auth.service.js');
// const asyncHandler = require('../../../common/asyncHandler.js');

const { asyncHandler } = require('@satish/common');

exports.register = asyncHandler(async (req, res) => {
  const result = await service.register(req.body);
  res.status(201).json({
    status: 'success',
    message: 'User registered',
    data: result.user,
    warnings: result.warnings,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const token = await service.login(
    req.body.email,
    req.body.password
  );

  res.json({ token });
});