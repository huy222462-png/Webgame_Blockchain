const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
  gameType: {
    type: String,
    enum: ['taixiu', 'fishing'],
    required: true
  },
  gameId: {
    type: Number,
    required: true
  },
  playerAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  betAmount: {
    type: String,
    default: '0'
  },
  winAmount: {
    type: String,
    default: '0'
  },
  result: {
    type: String,
    enum: ['win', 'lose', 'pending'],
    default: 'pending'
  },
  txHash: {
    type: String,
    required: true
  },
  blockNumber: Number,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

GameHistorySchema.index({ playerAddress: 1, createdAt: -1 });
GameHistorySchema.index({ gameType: 1, gameId: 1 });
GameHistorySchema.index({ txHash: 1 }, { unique: true });

module.exports = mongoose.model('GameHistory', GameHistorySchema);
