// Admin auth middleware
//
// Backward compatible:
// - Vẫn hỗ trợ header `x-admin-key` / query `adminKey` như tài liệu cũ.
// - Đồng thời hỗ trợ JWT access token với role: 'admin' | 'super_admin'.
const { authenticate } = require('./auth');

module.exports = (req, res, next) => {
  try {
    const key = req.headers['x-admin-key'] || req.query.adminKey;
    if (key && key === process.env.ADMIN_KEY) {
      req.user = req.user || { id: null, role: 'admin', source: 'admin-key' };
      return next();
    }

    authenticate(req, res, (err) => {
      if (err) {
        return; // authenticate đã tự trả response lỗi
      }
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthenticated' });
      }
      if (!['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Forbidden: admin only' });
      }
      return next();
    });
  } catch (e) {
    console.error('Admin auth error', e);
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
};
