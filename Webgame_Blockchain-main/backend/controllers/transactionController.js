const Transaction = require('../models/Transaction');

// Get all transactions for a player
exports.getPlayerTransactions = async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, page = 1, type, gameType, status } = req.query;
    
    const query = { fromAddress: address.toLowerCase() };
    if (type) query.type = type;
    if (gameType) query.gameType = gameType;
    if (status) query.status = status;
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save transaction
exports.saveTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction already exists' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { txHash } = req.params;
    const { status, blockNumber, gasUsed, gasPrice } = req.body;
    
    const transaction = await Transaction.findOneAndUpdate(
      { txHash },
      { status, blockNumber, gasUsed, gasPrice },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction by hash
exports.getTransaction = async (req, res) => {
  try {
    const { txHash } = req.params;
    
    const transaction = await Transaction.findOne({ txHash });
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
