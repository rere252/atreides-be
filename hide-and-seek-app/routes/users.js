const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { nickname, role, room } = req.body;
    const newUser = new User({ nickname, role, room });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(400).send({ message: 'Error registering user', error: error.message });
  }
});

router.post('/location', async (req, res) => {
  try {
    const { id, location } = req.body;
    const user = await User.findByIdAndUpdate(id, { location }, { new: true });
    res.status(200).send({ message: 'Location updated', user });
  } catch (error) {
    res.status(400).send({ message: 'Error updating location', error: error.message });
  }
});

module.exports = router;
