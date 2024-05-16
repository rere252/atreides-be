const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');

router.post('/register', async (req, res) => {
  try {
    const { nickname, role, room, userId } = req.body;
    let user = await User.findById(userId);
    if (user) {
      const previousRoom = user.room;
      await user.updateOne({ nickname, role, room });
      // If the players previous room has no more players, then set the game status to NOT_STARTED.
      const previousRoomPlayers = await User.find({ room: previousRoom });
      if (previousRoomPlayers.length < 1) {
        await Game.updateOne({ room: previousRoom }, { status: 'NOT_STARTED' });
      }
    } else {
      user = new User({ nickname, role, room });
      await user.save();
    }

    let game = await Game.findOne({room});
    if (!game) {
      game = new Game({room});
      game.save();
    }
    if (role === 'hider') {
      await Game.updateOne({room}, {status: 'HIDER_LOOKING_FOR_SPOT'});
    } else {
      if (game.status === 'ENDED' || game.status === 'NOT_STARTED') {
        await Game.updateOne({room}, {status: 'WAITING_FOR_HIDER'});
      }
    }
  
    res.status(201).send({ message: 'User registered successfully', id: user._id });
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

router.get('/nickname-taken/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;
    const { userId } = req.query;
    const user = await User.findOne({ nickname });
    res.status(200).send({ nicknameTaken: Boolean(user && user.id !== userId) });
  } catch (error) {
    res.status(500).send({ message: 'Error checking nickname', error: error.message });
  }
});

module.exports = router;
