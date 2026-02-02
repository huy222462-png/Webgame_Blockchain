const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_TOKEN_TTL = '15m'; // access token expiry
const REFRESH_TOKEN_TTL = '7d'; // refresh token expiry

function getJwtSecrets() {
  const accessSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret-change-me';
  return { accessSecret, refreshSecret };
}

/**
 * Tạo access token cho user
 */
function signAccessToken(user) {
  const { accessSecret } = getJwtSecrets();
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    accessSecret,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

/**
 * Tạo refresh token cho user
 * Sử dụng refreshTokenVersion để có thể revoke toàn bộ tokens cũ.
 */
function signRefreshToken(user) {
  const { refreshSecret } = getJwtSecrets();
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      v: user.refreshTokenVersion || 0
    },
    refreshSecret,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

/**
 * Middleware xác thực Access Token
 * - Đọc token từ header Authorization: Bearer <token>
 * - Gắn req.user = { id, role }
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing Authorization header' });
    }

    const { accessSecret } = getJwtSecrets();
    const payload = jwt.verify(token, accessSecret);
    const userId = payload.sub;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, error: 'User not found or deleted' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Account banned' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role
    };
    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Middleware kiểm tra role
 * - requiredRoles: mảng role được phép, ví dụ: ['admin', 'super_admin']
 */
function authorize(requiredRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    if (requiredRoles.length === 0) {
      return next();
    }
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Xác thực refresh token, trả về user nếu hợp lệ
 */
async function verifyRefreshToken(token) {
  const { refreshSecret } = getJwtSecrets();
  const payload = jwt.verify(token, refreshSecret);
  const user = await User.findById(payload.sub);
  if (!user || user.isDeleted) {
    throw new Error('User not found or deleted');
  }
  if (user.refreshTokenVersion !== (payload.v || 0)) {
    throw new Error('Refresh token revoked');
  }
  return user;
}

// Middleware bảo vệ admin
exports.adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Thiếu token xác thực' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-access-secret-change-me');

    const user = await User.findById(decoded.sub);
    if (!user || user.isDeleted || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Không có quyền truy cập' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin auth error', err);
    res.status(403).json({ success: false, error: 'Token không hợp lệ' });
  }
};

module.exports = {
  authenticate,
  authorize,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
};

