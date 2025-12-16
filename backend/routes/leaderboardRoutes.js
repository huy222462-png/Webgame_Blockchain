const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Get top players
router.get('/top', leaderboardController.getTopPlayers);

// Get player rank
router.get('/player/:address', leaderboardController.getPlayerRank);

// Update player name
router.put('/player/:address/name', leaderboardController.updatePlayerName);

module.exports = router;
