const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const playerCtrl = require('../controllers/playerController');
const gameEconomyCtrl = require('../controllers/gameEconomyController');

// POST /api/player/connect-wallet
router.post('/connect-wallet', authenticate, playerCtrl.connectWallet);

// Clicker economy endpoints
router.get('/me', authenticate, gameEconomyCtrl.getPlayerProfile);
router.post('/upgrade', authenticate, gameEconomyCtrl.playerUpgrade);
router.post('/withdraw', authenticate, gameEconomyCtrl.playerWithdraw);

module.exports = router;
