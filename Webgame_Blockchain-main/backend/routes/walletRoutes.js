const express = require('express');
const router = express.Router();
const checkDBConnection = require('../middleware/checkDB');
const walletController = require('../controllers/walletController');

// Ensure DB ready for all wallet operations
router.use(checkDBConnection);

router.post('/connect', walletController.connectWallet);
router.get('/:walletAddress', walletController.getWalletUser);

module.exports = router;
