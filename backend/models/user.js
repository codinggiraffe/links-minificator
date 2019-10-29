const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const uniqueValidator = require('mongoose-unique-validator');

const userScheme = mongoose.Schema({
  login: {type: String, required: true, unique: true},
  password: {type: String, required: true},
});

userScheme.plugin(uniqueValidator);

module.exports = mongoose.model('User', userScheme);
