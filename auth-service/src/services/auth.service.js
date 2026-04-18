const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const repo = require('../repositories/user.repository.js');
// const AppError = require('../../../common/AppError.js');
// const logger = require('../../../common/logger.js');
const { http, logger, AppError} = require('@satish/common');

exports.register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await repo.createUser({
    ...data,
    password: hashedPassword,
  });

  const response = await http.callService({
    method: 'POST',
    url: 'http://localhost:3002/users',
    data: {
      name: data.name,
      phone: data.phone,
    },
    headers: {
      'x-user-id': user.id,
      'x-user-role': user.role,
    },
    serviceName: 'user-service',
  });

  let warnings = [];

  if (!response?.success) {
    logger.warn('User profile creation failed', {
      userId: user.id,
      error: response?.error,
    });

    warnings.push('User profile not created');
  }

  return {
    user,
    warnings,
  };
};

exports.login = async (email, password) => {
  const user = await repo.findByEmail(email);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return token;
};