const User = require('../models/user.model.js');

exports.createUser = (data) => {
  return User.create(data);
};

exports.findByEmail = (email) => {
  return User.findOne({ where: { email } });
};