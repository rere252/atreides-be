const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const geolib = require('geolib');

router.post('/start', async (req, res) => {
  try {
    const { room } = req.body;
    
    const game = await Game.findOneAndUpdate({ room }, { status: 'active' }, { new: true });
    if (!game) {
      return res.status(404).send({ message: 'Room not found' });
    }
    res.status(200).send({ message: 'Game started', game });
  } catch (error) {
    res.status(400).send({ message: 'Error starting game', error: error.message });
  }
});


module.exports = router;
