const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Get player game history
router.get('/history/:address', gameController.getPlayerHistory);

// Save game result
router.post('/result', gameController.saveGameResult);

// Get game statistics
router.get('/stats/:gameType', gameController.getGameStats);

module.exports = router;
