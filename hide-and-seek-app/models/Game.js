const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['HIDER_LOOKING_FOR_SPOT', 'STARTED', 'ENDED', 'WAITING_FOR_PLAYERS'],
    default: 'WAITING_FOR_PLAYERS'
  },
  hiderLocation: {
    exact: {
      latitude: Number,
      longitude: Number
    },
    approximate: {
      latitude: Number,
      longitude: Number
    }
  },
  winnerNickname: String
});

module.exports = mongoose.model('Game', gameSchema);