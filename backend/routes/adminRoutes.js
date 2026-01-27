const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const checkDBConnection = require('../middleware/checkDB');
const adminCtrl = require('../controllers/adminController');
const walletAdminCtrl = require('../controllers/walletAdminController');
const gameEconomyCtrl = require('../controllers/gameEconomyController');
const walletEconomyAdminCtrl = require('../controllers/walletEconomyAdminController');

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

// Wallet user management
router.get('/users', (req, res, next) => {
	if (req.query.type === 'legacy') {
		return adminCtrl.listUsers(req, res, next);
	}
	if (req.query.type === 'game') {
		return gameEconomyCtrl.listPlayers(req, res, next);
	}
	return walletAdminCtrl.listUsers(req, res, next);
});

router.get('/users/:id', (req, res, next) => {
	if (req.query.type === 'legacy') {
		return adminCtrl.getUserDetail(req, res, next);
	}
	return walletAdminCtrl.getUserDetail(req, res, next);
});

router.patch('/users/:id', (req, res, next) => {
	if (req.query.type === 'legacy') {
		return adminCtrl.updateUser(req, res, next);
	}
	return walletAdminCtrl.updateUser(req, res, next);
});

router.delete('/users/:id', (req, res, next) => {
	if (req.query.type === 'legacy') {
		return adminCtrl.softDeleteUser(req, res, next);
	}
	return walletAdminCtrl.deleteUser(req, res, next);
});

// Game economy admin operations
router.get('/game/players', gameEconomyCtrl.listPlayers);
router.get('/game/config', gameEconomyCtrl.getAdminConfig);
router.patch('/game/config', gameEconomyCtrl.updateAdminConfig);
router.post('/game/convert-points', gameEconomyCtrl.adminConvertPoints);
router.get('/game/withdraw-requests', gameEconomyCtrl.listWithdrawRequests);
router.patch('/game/withdraw/:id', gameEconomyCtrl.reviewWithdrawRequest);

// Wallet economy (wallet users) withdraw management
router.get('/wallet/withdraw-requests', walletEconomyAdminCtrl.listWithdrawRequests);
router.patch('/wallet/withdraw/:id', walletEconomyAdminCtrl.reviewWithdrawRequest);

router.post('/users/:id/ban', walletAdminCtrl.banUser);
router.post('/users/:id/unban', walletAdminCtrl.unbanUser);

// Legacy admin user management
router.post('/promote/:userId', adminCtrl.promoteToAdmin);
router.post('/demote/:userId', adminCtrl.demoteAdmin);

// Balance operations
router.post('/deposit', adminCtrl.adminDeposit);
router.post('/withdraw', adminCtrl.adminWithdraw);
router.post('/transfer', adminCtrl.adminTransfer);
router.post('/notify', adminCtrl.sendNotification);

// notification helpers
router.get('/notifications', adminCtrl.listNotifications);
router.post('/notifications/:id/read', adminCtrl.markNotificationRead);

module.exports = router;
