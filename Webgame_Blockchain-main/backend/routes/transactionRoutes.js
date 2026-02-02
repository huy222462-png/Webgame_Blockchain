const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get player transactions
router.get('/player/:address', transactionController.getPlayerTransactions);

// Save transaction
router.post('/', transactionController.saveTransaction);

// Get transaction by hash
router.get('/:txHash', transactionController.getTransaction);

// Update transaction status
router.put('/:txHash', transactionController.updateTransactionStatus);

module.exports = router;
