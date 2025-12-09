const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Đăng ký người dùng mới
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json(newUser);
});

module.exports = router;
