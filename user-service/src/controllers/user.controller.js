const service = require('../services/user.service');
const asyncHandler = require('../../../common/asyncHandler');

exports.createUser = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  const user = await service.createUser({
    ...req.body,
    user_id: userId,
  });
  res.json(user);
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await service.getUser(req.params.id);
  res.json(user);
});