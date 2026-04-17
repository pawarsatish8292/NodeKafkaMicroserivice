const User = require('../models/user.model');

exports.create = (data) => User.create(data);

exports.findById = (id) => User.findByPk(id);

exports.findByUserId = (userId) =>  User.findOne({ where: { user_id: userId } });