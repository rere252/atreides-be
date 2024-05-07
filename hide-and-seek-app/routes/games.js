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

// 1.Check whether a room has a hider
router.get('/check-hider/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const hider = await User.findOne({ room: roomId, role: 'hider' });
    res.status(200).send({ hasHider: !!hider });
  } catch (error) {
    res.status(500).send({ message: 'Error checking for hider', error: error.message });
  }
});

// 2. Lock in the hider's position
router.post('/lock-hider-location', async (req, res) => {
  const { roomId, location } = req.body;
  try {
    const approximateLocation = geolib.computeDestinationPoint(location, 1500, Math.random() * 360);
    await Game.findOneAndUpdate(
      { room: roomId },
      {
        status: 'active',
        'hiderLocation.exact': location,
        'hiderLocation.approximate': {
          latitude: approximateLocation.latitude,
          longitude: approximateLocation.longitude
        }
      },
      { new: true }
    );
    res.status(202).send();
  } catch (error) {
    res.status(400).send({ message: 'Error locking hider location', error: error.message });
  }
});

// 3. Update seekers location
router.post('/update-seeker-location', async (req, res) => {
  const { seekerId, location: newLocation } = req.body;
  try {
    const user = await User.findById(seekerId);
    const game = await Game.findOne({ room: user.room });
    if (!game) return res.status(404).send({ message: 'Game not found' });

    const previousLocation = user.location;
    const currentDistance = geolib.getDistance(newLocation, game.hiderLocation.exact);

    let guidance = 'NO_CHANGE';
    if (previousLocation) {
      const previousDistance = geolib.getDistance(previousLocation, game.hiderLocation.exact);
      if (currentDistance < previousDistance && Math.abs(currentDistance - previousDistance) > 2) {
        guidance = 'GOT_CLOSER';
      } else if (currentDistance > previousDistance && Math.abs(currentDistance - previousDistance) > 2) {
        guidance = 'WENT_FURTHER';
      }
    }

    await User.findByIdAndUpdate(seekerId, { location: newLocation });

    const result = currentDistance <= 50 ? 'FOUND' : 'NOT_FOUND';
    if (result === 'FOUND') {
      await Game.findByIdAndUpdate(game._id, { status: 'ENDED', winnerNickname: user.nickname });
      await User.deleteMany({ room: user.room });
    }
  
    res.status(200).send({ result, guidance });
  } catch (error) {
    res.status(400).send({ message: 'Error updating seeker location', error: error.message });
  }
});


// 4. Poll game state
router.get('/poll-game-state/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const game = await Game.findOne({ room: roomId });
    if (!game) {
      return res.status(404).send({ message: 'Game not found' });
    }
    res.status(200).send({
      status: game.status,
      hidersApproximateLocation: game.hiderLocation.approximate,
      winnerNickname: game.winnerNickname
    });
  } catch (error) {
    res.status(500).send({ message: 'Error polling game state', error: error.message });
  }
});

module.exports = router;
