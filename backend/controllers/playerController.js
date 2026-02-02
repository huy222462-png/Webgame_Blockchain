const User = require('../models/User');
const WalletConnection = require('../models/WalletConnection');

// Validate Ethereum address
function isValidAddress(addr) {
  return typeof addr === 'string' && /^0x[0-9a-fA-F]{40}$/.test(addr);
}

// POST /api/player/connect-wallet
// Protected: requires authenticate middleware (req.user populated with {id, role})
exports.connectWallet = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthenticated' });

    const { walletAddress } = req.body;
    if (!walletAddress || !isValidAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }

    const addr = walletAddress.toLowerCase();

    // Ensure wallet isn't already linked to another user
    const existing = await User.findOne({ walletAddress: addr, _id: { $ne: userId } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Wallet address already linked to another user' });
    }

    // Update user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.walletAddress = addr;
    user.isWalletConnected = true;
    user.updatedAt = new Date();
    await user.save();

    // Record wallet connection history
    try {
      await WalletConnection.create({ user: user._id, address: addr, ip: req.ip, userAgent: req.get('User-Agent') });
    } catch (e) {
      // non-fatal
      console.warn('Failed to create WalletConnection record', e.message);
    }

    return res.json({ success: true, data: { walletAddress: addr, isWalletConnected: user.isWalletConnected } });
  } catch (err) {
    console.error('connectWallet error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
