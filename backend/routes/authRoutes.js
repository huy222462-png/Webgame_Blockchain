const express = require('express');
const router = express.Router();
const ethers = require('ethers');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const WalletConnection = require('../models/WalletConnection');

// Email / password auth
// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me  (requires access token)
router.get('/me', authenticate, authController.me);

// POST /api/auth/link-wallet  (requires access token)
router.post('/link-wallet', authenticate, authController.linkWallet);

// Web3 signature verification (giữ route cũ để không phá vỡ frontend hiện tại)
// POST /api/auth/verify
// body: { address, message, signature }
router.post('/verify', async (req, res) => {
  const { address, message, signature } = req.body;
  if (!address || !message || !signature) {
    return res.status(400).json({ success: false, error: 'Missing address/message/signature' });
  }
  try {
    // recover address from signed message
    const recovered = ethers.utils.verifyMessage(message, signature);
    const match = recovered.toLowerCase() === address.toLowerCase();

    // Lưu lịch sử kết nối ví (không ràng buộc với user cụ thể)
    await WalletConnection.create({
      address: address.toLowerCase(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      action: 'login_signature'
    });

    return res.json({ success: match, recovered, match });
  } catch (err) {
    console.error('Verify error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
