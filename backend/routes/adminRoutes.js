const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const checkDBConnection = require('../middleware/checkDB');
const adminCtrl = require('../controllers/adminController');

// Public routes - không cần auth nhưng cần DB connection
// Đăng ký admin (public - tạo super_admin đầu tiên hoặc admin thường)
router.post('/register', checkDBConnection, adminCtrl.registerAdmin);

// Đăng nhập admin (public)
router.post('/login', checkDBConnection, adminCtrl.loginAdmin);

// All other admin routes require ADMIN_KEY header 'x-admin-key' (or ?adminKey=...) hoặc JWT token
// Và cần DB connection
router.use(checkDBConnection);
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminCtrl.getDashboardStats);

// User management
router.post('/promote/:userId', adminCtrl.promoteToAdmin);
router.post('/demote/:userId', adminCtrl.demoteAdmin);
router.get('/users', adminCtrl.listUsers);
router.get('/users/:userId', adminCtrl.getUserDetail);
router.patch('/users/:userId', adminCtrl.updateUser);
router.delete('/users/:userId', adminCtrl.softDeleteUser);

// Balance operations
router.post('/deposit', adminCtrl.adminDeposit);
router.post('/withdraw', adminCtrl.adminWithdraw);
router.post('/transfer', adminCtrl.adminTransfer);
router.post('/notify', adminCtrl.sendNotification);

// notification helpers
router.get('/notifications', adminCtrl.listNotifications);
router.post('/notifications/:id/read', adminCtrl.markNotificationRead);

module.exports = router;
