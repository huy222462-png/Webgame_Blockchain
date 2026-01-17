const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const playerCtrl = require('../controllers/playerController');

// POST /api/player/connect-wallet
router.post('/connect-wallet', authenticate, playerCtrl.connectWallet);

module.exports = router;
