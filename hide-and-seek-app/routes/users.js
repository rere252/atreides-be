const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { nickname, role, room } = req.body;
    const newUser = new User({ nickname, role, room });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully', id: newUser._id });
  } catch (error) {
    res.status(400).send({ message: 'Error registering user', error: error.message });
  }
});

router.post('/location', async (req, res) => {
  try {
    const { id, location } = req.body;
    const user = await User.findByIdAndUpdate(id, { location }, { new: true });
    const game = await Game.findOne({ room: user.room });

    // Assuming only 1 hider, and multiple seekers!!!!!!
    const hider = await User.findOne({ room: user.room, role: 'hider' });
    if (!hider) {
      return res.status(404).send({ message: 'Hider not found' });
    }

    const previousDistance = geolib.getDistance(
      { latitude: user.location.latitude, longitude: user.location.longitude },
      { latitude: hider.location.latitude, longitude: hider.location.longitude }
    );

    const currentDistance = geolib.getDistance(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: hider.location.latitude, longitude: hider.location.longitude }
    );

    const direction = currentDistance < previousDistance ? 'closer' : 'further';

    res.status(200).send({
      message: 'Location updated',
      user,
      direction,
      gameStatus: game.status
    });
  } catch (error) {
    res.status(400).send({ message: 'Error updating location', error: error.message });
  }
});

module.exports = router;
