const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const geolib = require('geolib');


// 1. Check whether a room has a hider
router.get('/check-hider/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const hider = await User.findOne({ room: roomId, role: 'hider' });
    const game = await Game.findOne({ room: roomId });
    res.status(200).send({ hasHider: Boolean(!!hider || (hider && game?.status === 'ENDED')) });
  } catch (error) {
    res.status(500).send({ message: 'Error checking for hider', error: error.message });
  }
});

// 2. Lock in the hider's position
router.post('/lock-hider-location', async (req, res) => {
  const { roomId, location} = req.body;
  try {
    const hiderNickname = (await User.findOne({ room: roomId, role: 'hider' })).nickname;
    const random = Math.random();
    const approximateLocation = geolib.computeDestinationPoint(location, random * 1000, random * 360);
    await Game.findOneAndUpdate(
      { room: roomId },
      {
        status: 'STARTED',
        hiderLocation: {
          exact: location,
          approximate: approximateLocation
        },
        hiderNickname
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

    const currentDistanceToHider = geolib.getDistance(newLocation, game.hiderLocation.exact);

    await User.findByIdAndUpdate(seekerId, { location: newLocation });

    const result = currentDistanceToHider <= 10 ? 'FOUND' : 'NOT_FOUND';
    if (result === 'FOUND') {
      await Game.findByIdAndUpdate(
        game._id, 
        {
          status: 'ENDED',
          winnerNickname: user.nickname,
          hidersExactLocation: game.hiderLocation.exact,
        }
      );
      await User.deleteMany({ room: user.room });
    }

    const roomsSeekers = await User.find({ room: user.room, role: 'seeker' });
    const seekersWithDistanceToHider = roomsSeekers.map(seeker => {
      const distance = geolib.getDistance(seeker.location, game.hiderLocation.exact);
      return { nickname: seeker.nickname, distance };
    });
    const closestSeeker = seekersWithDistanceToHider.reduce(
      (closest, seeker) => seeker.distance < closest.distance ? seeker : closest,
      { distance: Infinity }
    );
    await Game.findByIdAndUpdate(game._id, { closestSeekerNickname: closestSeeker.nickname });
    console.log('Closest seeker:', closestSeeker.nickname, 'Distance:', closestSeeker.distance)
  
    res.status(200).send({ result, distanceToHider: currentDistanceToHider });
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
    const stateResponse = {
      status: game.status
    };
    if (game.status !== 'STARTED') {
      stateResponse.winnerNickname = game.winnerNickname;
      stateResponse.hiderNickname = game.hiderNickname;
    }
    if (game.status === 'ENDED' || game.status === 'NOT_STARTED') {
      stateResponse.hidersExactLocation = game.hiderLocation?.exact;
    }
    if (game.status === 'STARTED') {
      const approximateLocation = game.hiderLocation?.approximate;
      if (approximateLocation.latitude && approximateLocation.longitude) {
        stateResponse.hidersApproximateLocation = approximateLocation;
      }
    }
    if (game.closestSeekerNickname) {
      stateResponse.closestSeekerNickname = game.closestSeekerNickname;
    }
    const role = req.query.role;
    if (role === 'hider' && game.status === 'STARTED') {
      // Get seekers locations
      const seekers = await User.find({ room: roomId, role: 'seeker' });
      stateResponse.seekersLocations = seekers.map(seeker => seeker.location);
    }
    res.status(200).send(stateResponse);
  } catch (error) {
    res.status(500).send({ message: 'Error polling game state', error: error.message });
  }
});

// 5. Reset game
router.post('/reset-game', async (req, res) => {
  const { roomId } = req.body;
  try {
    const game = await Game.findOne({ room: roomId });
    if (game.status === 'ENDED') {
      await game.updateOne({ status: 'NOT_STARTED', hiderLocation: null});
    }
    res.status(202).send();
  } catch (error) {
    res.status(400).send({ message: 'Error resetting game', error: error.message });
  }
});

// 6. Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const games = await Game.find();
    const roomsWithPlayerCount = await Promise.all(games.map(async game => {
      const room = game.room;
      const playerCount = await User.countDocuments({ room });
      return { name: room, playerCount, status: game.status };
    }));
    res.status(200).send(roomsWithPlayerCount);
  } catch (error) {
    res.status(500).send({ message: 'Error getting rooms', error: error.message });
  }
});

// 7. Check if room exists
router.get('/room-exists/:roomName', async (req, res) => {
  try {
    const { roomName } = req.params;
    const game = await Game.findOne({ room: roomName });
    res.status(200).send({ roomExists: Boolean(game) });
  } catch (error) {
    res.status(500).send({ message: 'Error checking room', error: error.message });
  }
});

// 8. Check if player is still in room
router.get('/player-in-room/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const user = await User.findById(playerId);
    res.status(200).send({ inRoom: Boolean(user) });
  } catch (error) {
    res.status(500).send({ message: 'Error checking player', error: error.message });
  }
});

// 9. Remove user from room
router.delete('/remove-from-room/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (user) {
      const room = user.room;
      await User.findByIdAndUpdate(userId, { room: null });
      const roomsPlayerCount = await User.countDocuments({ room });
      if (roomsPlayerCount < 1) {
        await Game.findOneAndUpdate(
          { room },
          { status: 'NOT_STARTED', hiderLocation: null, hiderNickname: null, winnerNickname: null}
        );
      }
    }
    res.status(202).send();
  } catch (error) {
    res.status(400).send({ message: 'Error removing user from room', error: error.message });
  }
});

module.exports = router;
