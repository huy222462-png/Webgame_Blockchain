const mongoose = require('mongoose');

const UpgradeHistorySchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['click', 'idle'],
      required: true
    },
    levelBefore: {
      type: Number,
      required: true,
      min: 0
    },
    levelAfter: {
      type: Number,
      required: true,
      min: 0
    },
    coinCost: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

UpgradeHistorySchema.index({ walletAddress: 1, createdAt: -1 });
UpgradeHistorySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('UpgradeHistory', UpgradeHistorySchema);
