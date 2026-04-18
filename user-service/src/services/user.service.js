const repo = require('../repositories/user.repository');
// const logger = require('../../../common/logger.js');
// const AppError = require('../../../common/AppError');

const {
  AppError,
  logger
} = require('@satish/common');

exports.createUser = async (data) => {
  logger.info('Creating user', { data });

  const existing = await repo.findByUserId(data.user_id);

  if (existing) {
    throw new AppError('User profile already exists', 400);
  }

  return repo.create(data);
};

exports.getUser = async (id) => {
  return repo.findByUserId(id);
};