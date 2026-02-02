const mongoose = require('mongoose');

/**
 * WalletConnection
 *
 * Lưu lịch sử kết nối ví cho từng user / địa chỉ.
 * Có thể dùng để:
 * - Hiển thị trong trang Admin
 * - Phân tích bảo mật / hành vi bất thường
 */
const WalletConnectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    address: { type: String, required: true, lowercase: true },
    userAgent: { type: String },
    ip: { type: String },
    // action: e.g. "connect", "login_signature"
    action: { type: String, default: 'connect' }
  },
  { timestamps: true }
);

WalletConnectionSchema.index({ address: 1, createdAt: -1 });
WalletConnectionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('WalletConnection', WalletConnectionSchema);

