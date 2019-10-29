const mongoose = require('mongoose');

const linkScheme = mongoose.Schema({
  link: {type: String, required: true},
  shortLink: {type: String, required: true, unique: true},
  anonymous: {type: Boolean, required: true},
  authorId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false},
  clickCounter: {type: Number, required: true, default: 0}
});

module.exports = mongoose.model('Link', linkScheme);
