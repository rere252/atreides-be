const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const geolib = require('geolib');

router.post('/start', async (req, res) => {
  try {
    const { room, players } = req.body;
    const newGame = new Game({ room, players, status: 'active' });
    await newGame.save();
    res.status(201).send({ message: 'Game started', game: newGame });
  } catch (error) {
    res.status(400).send({ message: 'Error starting game', error: error.message });
  }
});

router.post('/check-distance', async (req, res) => {
  const { seekerId, hiderId } = req.body;
  const seeker = await User.findById(seekerId);
  const hider = await User.findById(hiderId);
  
  const distance = geolib.getDistance(
    { latitude: seeker.location.latitude, longitude: seeker.location.longitude },
    { latitude: hider.location.latitude, longitude: hider.location.longitude }
  );

  const isFound = distance <= 50; // Distance in meters
  res.status(200).send({ isFound, distance });
});

module.exports = router;
