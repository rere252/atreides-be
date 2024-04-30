const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  hider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  seekers: [mongoose.Schema.Types.ObjectId],
  location: {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: [{ type: Number }]
  }
});

module.exports = mongoose.model('Room', roomSchema);