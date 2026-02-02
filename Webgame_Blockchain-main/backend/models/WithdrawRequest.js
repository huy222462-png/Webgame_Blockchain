const mongoose = require('mongoose');

const WithdrawRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    note: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
  },
  { timestamps: { createdAt: 'requestedAt', updatedAt: true } }
);

WithdrawRequestSchema.index({ status: 1, requestedAt: -1 });
WithdrawRequestSchema.index({ user: 1, requestedAt: -1 });

module.exports = mongoose.model('WithdrawRequest', WithdrawRequestSchema);
