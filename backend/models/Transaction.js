const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  fromAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  toAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  value: {
    type: String,
    required: true
  },
  gasUsed: String,
  gasPrice: String,
  blockNumber: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['bet', 'withdraw', 'claim', 'session'],
    required: true
  },
  gameType: {
    type: String,
    enum: ['taixiu', 'fishing'],
    required: true
  }
}, { timestamps: true });

TransactionSchema.index({ txHash: 1 });
TransactionSchema.index({ fromAddress: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
