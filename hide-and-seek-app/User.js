const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: String,
  role: String,
  position: {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: [{ type: Number }]
  }
});

module.exports = mongoose.model('User', userSchema);