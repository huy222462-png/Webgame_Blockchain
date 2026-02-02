const mongoose = require('mongoose');

const WithdrawHistorySchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
      default: 'pending'
    },
    txHash: {
      type: String,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    reviewNote: {
      type: String,
      default: null
    },
    reviewedBy: {
      type: String,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

WithdrawHistorySchema.index({ walletAddress: 1, createdAt: -1 });
WithdrawHistorySchema.index({ walletAddress: 1, status: 1 });
WithdrawHistorySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('WithdrawHistory', WithdrawHistorySchema);
