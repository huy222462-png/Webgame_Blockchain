const bcrypt = require('bcrypt');
const User = require('../models/User');
const WalletConnection = require('../models/WalletConnection');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;

/**
 * Đăng ký tài khoản mới (email/username/password)
 */
exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, error: 'Missing email/username/password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Ensure unique email/username
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email or username already in use' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email: email.toLowerCase(),
      username,
      password: hashed
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Đăng nhập bằng email / username + password
 */
exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, error: 'Missing emailOrUsername/password' });
    }

    const query = emailOrUsername.includes('@')
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername };

    const user = await User.findOne(query);
    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Account banned' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Refresh access token từ refresh token
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Missing refreshToken' });
    }

    const user = await verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return res.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

/**
 * Logout: tăng version để revoke toàn bộ refresh token cũ
 */
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Lấy thông tin hiện tại của user (dùng access token)
 */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Liên kết ví với tài khoản user hiện tại
 * - Body: { address }
 * - Yêu cầu đã login (middleware authenticate)
 */
exports.linkWallet = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Missing address' });
    }

    const normalized = address.toLowerCase();
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.walletAddress = normalized;
    await user.save();

    await WalletConnection.create({
      user: user._id,
      address: normalized,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      action: 'link_wallet'
    });

    return res.json({
      success: true,
      data: {
        walletAddress: user.walletAddress
      }
    });
  } catch (err) {
    console.error('Link wallet error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

