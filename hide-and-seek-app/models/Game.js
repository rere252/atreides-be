const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['HIDER_LOOKING_FOR_SPOT', 'STARTED', 'ENDED', 'WAITING_FOR_HIDER', 'NOT_STARTED'],
    default: 'WAITING_FOR_HIDER'
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
  hiderNickname: String,
  winnerNickname: String
});

module.exports = mongoose.model('Game', gameSchema);