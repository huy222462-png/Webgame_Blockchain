const mongoose = require('mongoose');

const ExchangeHistorySchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    pointsSpent: {
      type: Number,
      required: true,
      min: 0
    },
    coinReceived: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

ExchangeHistorySchema.index({ walletAddress: 1, createdAt: -1 });

module.exports = mongoose.model('ExchangeHistory', ExchangeHistorySchema);
