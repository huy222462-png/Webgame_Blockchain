const mongoose = require('mongoose');

/**
 * WalletUser schema
 *
 * Quản lý người chơi đăng nhập bằng ví (không email / password).
 * Admin account vẫn dùng model User cũ.
 * 
 * Hỗ trợ cả Ethereum (0x...) và Hedera (0.0.xxxxx) addresses
 */
const WalletUserSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Accepts: 0x... (Ethereum) or 0.0.xxxxx (Hedera Account ID)
    },
    // Network type detected from wallet address
    networkType: {
      type: String,
      enum: ['ethereum', 'hedera'],
      default: function() {
        return this.walletAddress?.match(/^0\.0\.\d+$/) ? 'hedera' : 'ethereum';
      }
    },
    // User's preferred withdrawal network (can differ from login network)
    preferredWithdrawNetwork: {
      type: String,
      enum: ['ethereum', 'hedera', 'auto'],
      default: 'auto' // Auto = use same as networkType
    },
    // Withdrawal address (if different from login address)
    withdrawalAddress: {
      type: String,
      trim: true,
      default: null
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    bomdogCoin: {
      type: Number,
      default: 0,
      min: 0
    },
    lockedBomdogCoin: {
      type: Number,
      default: 0,
      min: 0
    },
    clickLevel: {
      type: Number,
      default: 1,
      min: 1
    },
    idleLevel: {
      type: Number,
      default: 1,
      min: 1
    },
    lastClaimTime: {
      type: Date,
      default: () => new Date()
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'ban', 'banned'],
      default: 'active'
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

WalletUserSchema.index({ walletAddress: 1 }, { unique: true });
WalletUserSchema.index({ lastActive: -1 });
WalletUserSchema.index({ status: 1 });

WalletUserSchema.pre('save', function syncScoreWithPoints(next) {
  if (this.isModified('points')) {
    this.score = this.points;
  } else if (this.isModified('score') && !this.isModified('points')) {
    this.points = this.score;
  }
  next();
});

module.exports = mongoose.model('WalletUser', WalletUserSchema);
