const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Giữ endpoint cũ nhưng delegate sang luồng register chuẩn (bcrypt + validate + JWT)
router.post('/register', authController.register);

// Lấy thông tin user theo id (yêu cầu đã đăng nhập)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Chỉ cho phép lấy chính mình, có thể mở rộng thêm sau nếu cần
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
