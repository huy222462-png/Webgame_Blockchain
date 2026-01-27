const express = require('express');
const router = express.Router();
const { verifyMessage } = require('ethers');
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
  const { address, message, signature } = req.body || {};

  if (!address || typeof address !== 'string' || !message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing address or message' });
  }

  if (!signature || typeof signature !== 'string' || signature.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Signature is required' });
  }

  try {
    const recovered = verifyMessage(message, signature);
    const match = recovered && recovered.toLowerCase() === address.toLowerCase();

    await WalletConnection.create({
      address: address.toLowerCase(),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      action: match ? 'login_signature' : 'login_signature_failed'
    });

    if (!match) {
      return res.status(401).json({ success: false, recovered, match, error: 'Signature mismatch' });
    }

    return res.json({ success: true, recovered, match });
  } catch (err) {
    console.error('Verify error', err);
    const statusCode = err?.code === 'INVALID_ARGUMENT' ? 400 : 500;
    return res.status(statusCode).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
