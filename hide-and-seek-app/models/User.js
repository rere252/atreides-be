const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['hider', 'seeker'],
    required: true
  },
  room: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number
  }
});

module.exports = mongoose.model('User', userSchema);
