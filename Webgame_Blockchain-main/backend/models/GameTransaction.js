const mongoose = require('mongoose');

const GameTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['convert', 'upgrade', 'withdraw'],
      required: true
    },
    amount: { type: Number, min: 0, default: 0 },
    balanceBefore: { type: Number, min: 0 },
    balanceAfter: { type: Number, min: 0 },
    pointsBefore: { type: Number, min: 0 },
    pointsAfter: { type: Number, min: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

GameTransactionSchema.index({ user: 1, createdAt: -1 });
GameTransactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('GameTransaction', GameTransactionSchema);
