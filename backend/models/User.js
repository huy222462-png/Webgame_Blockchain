const mongoose = require('mongoose');

/**
 * User schema
 *
 * NOTE:
 * - We keep existing fields (role, isAdmin, locked, balance) for backward compatibility.
 * - New fields are added to support:
 *   + role-based access control (user | admin | super_admin)
 *   + account status (active | banned)
 *   + soft delete
 *   + auth tokens + last login tracking
 *   + optional wallet linkage & basic game stats
 */
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Role-based access control
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user'
    },

    // Legacy flag, still kept for old code that may check `isAdmin`
    isAdmin: { type: Boolean, default: false },

    // Account status & lock flags
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active'
    },
    locked: { type: Boolean, default: false },

    // Soft delete support
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    // Wallet linkage (off-chain mapping to on-chain address)
    walletAddress: { type: String, lowercase: true, default: null },

    // Basic game stats (can be extended later or computed from histories)
    gamesPlayed: { type: Number, default: 0 },

    // Store in-game token/point balance as string (wei) to avoid precision issues
    balance: { type: String, default: '0' },

    // Auth/session helpers
    lastLoginAt: { type: Date, default: null },
    refreshTokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: false });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isDeleted: 1, deletedAt: 1 });

module.exports = mongoose.model('User', UserSchema);
