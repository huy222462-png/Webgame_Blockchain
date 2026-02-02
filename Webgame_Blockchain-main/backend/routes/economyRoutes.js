const express = require('express');
const router = express.Router();
const checkDBConnection = require('../middleware/checkDB');
const walletEconomyController = require('../controllers/walletEconomyController');

router.use(checkDBConnection);

router.get('/economy/:walletAddress', walletEconomyController.getProfile);
router.post('/exchange', walletEconomyController.exchangePoints);
router.post('/upgrade', walletEconomyController.upgrade);
router.post('/withdraw', walletEconomyController.withdraw);

module.exports = router;
