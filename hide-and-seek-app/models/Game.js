const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  }
});

module.exports = mongoose.model('Game', gameSchema);
