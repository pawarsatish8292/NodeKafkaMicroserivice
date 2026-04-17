const AppError = require('../../../common/AppError.js');

module.exports = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password required', 400));
  }

  next();
};