const express = require('express');
const router = express.Router();
const checkDBConnection = require('../middleware/checkDB');
const gameController = require('../controllers/gameController');
const walletController = require('../controllers/walletController');

router.use(checkDBConnection);

// Get player game history
router.get('/history/:address', gameController.getPlayerHistory);

// Save game result
router.post('/result', gameController.saveGameResult);

// Click-to-earn (off-chain score stored in Mongo)
router.post('/click', walletController.handleClick);

// Get game statistics
router.get('/stats/:gameType', gameController.getGameStats);

module.exports = router;
