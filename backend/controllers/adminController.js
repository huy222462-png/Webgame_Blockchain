const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const GameHistory = require('../models/GameHistory');
const WalletConnection = require('../models/WalletConnection');
const { BigNumber } = require('ethers');

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_TTL = '15m';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-access-secret-change-me';

// Helper to add/subtract string balances (wei)
function addBalance(currentStr, deltaStr) {
  const a = BigNumber.from(currentStr);
  const b = BigNumber.from(deltaStr);
  return a.add(b).toString();
}
function subBalance(currentStr, deltaStr) {
  const a = BigNumber.from(currentStr);
  const b = BigNumber.from(deltaStr);
  if (a.lt(b)) throw new Error('Insufficient balance');
  return a.sub(b).toString();
}

// Promote user to admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = 'admin';
    user.isAdmin = true;
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Demote admin
exports.demoteAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = 'user';
    user.isAdmin = false;
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List users with pagination + search + filter
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, q, role, status, hasWallet, includeDeleted } = req.query;

    const query = {};

    if (!includeDeleted || includeDeleted === 'false') {
      query.isDeleted = { $ne: true };
    }

    if (q) {
      query.$or = [
        { username: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (hasWallet === 'true') {
      query.walletAddress = { $ne: null };
    } else if (hasWallet === 'false') {
      query.$or = query.$or || [];
      query.$or.push({ walletAddress: null }, { walletAddress: { $exists: false } });
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single user detail + basic stats
exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Số game đã chơi: tính từ GameHistory theo địa chỉ ví (nếu có)
    let gamesPlayed = user.gamesPlayed || 0;
    if (user.walletAddress) {
      gamesPlayed = await GameHistory.countDocuments({ playerAddress: user.walletAddress.toLowerCase() });
    }

    // Lịch sử kết nối ví (giới hạn 20 bản ghi mới nhất)
    const walletHistory = await WalletConnection.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: {
        user,
        stats: {
          gamesPlayed,
          balance: user.balance
        },
        walletHistory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update user (role, status, lock/unlock, basic fields)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      username,
      email,
      role,
      status,
      locked,
      walletAddress,
      balance
    } = req.body;

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (locked !== undefined) updates.locked = !!locked;
    if (walletAddress !== undefined) updates.walletAddress = walletAddress ? walletAddress.toLowerCase() : null;
    if (balance !== undefined) updates.balance = balance;

    // Password changes are not allowed here for safety

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Soft delete user
exports.softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    // Khi xóa mềm, cũng đặt status = banned để đảm bảo không đăng nhập lại
    user.status = 'banned';
    await user.save();

    res.json({ success: true, data: { id: user._id, isDeleted: user.isDeleted, deletedAt: user.deletedAt } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin deposit into user's balance
exports.adminDeposit = async (req, res) => {
  try {
    const { userId, amountWei, note } = req.body; // amount in wei string
    if (!userId || !amountWei) return res.status(400).json({ success: false, error: 'Missing parameters' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.balance = addBalance(user.balance || '0', amountWei);
    await user.save();

    const tx = new Transaction({
      txHash: `admin-deposit-${Date.now()}-${userId}`,
      fromAddress: 'admin',
      toAddress: user.email || 'unknown',
      value: amountWei,
      type: 'admin_deposit',
      status: 'confirmed',
      toUser: user._id
    });
    await tx.save();

    // create notification
    await Notification.create({ user: user._id, title: 'Deposit by admin', message: `Your account has been credited with ${amountWei} wei. ${note || ''}` });

    res.json({ success: true, data: { user, tx } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin withdraw from user's balance
exports.adminWithdraw = async (req, res) => {
  try {
    const { userId, amountWei, note } = req.body;
    if (!userId || !amountWei) return res.status(400).json({ success: false, error: 'Missing parameters' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    try {
      user.balance = subBalance(user.balance || '0', amountWei);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    await user.save();

    const tx = new Transaction({
      txHash: `admin-withdraw-${Date.now()}-${userId}`,
      fromAddress: user.email || 'unknown',
      toAddress: 'admin',
      value: amountWei,
      type: 'admin_withdraw',
      status: 'confirmed',
      fromUser: user._id
    });
    await tx.save();

    await Notification.create({ user: user._id, title: 'Withdrawal by admin', message: `An amount of ${amountWei} wei was withdrawn from your account. ${note || ''}` });

    res.json({ success: true, data: { user, tx } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin transfer between users (or admin to user)
exports.adminTransfer = async (req, res) => {
  try {
    const { fromUserId, toUserId, amountWei, note } = req.body;
    if (!fromUserId || !toUserId || !amountWei) return res.status(400).json({ success: false, error: 'Missing parameters' });

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) return res.status(404).json({ success: false, error: 'User(s) not found' });

    try {
      fromUser.balance = subBalance(fromUser.balance || '0', amountWei);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Insufficient balance on fromUser' });
    }
    toUser.balance = addBalance(toUser.balance || '0', amountWei);

    await fromUser.save();
    await toUser.save();

    const tx = new Transaction({
      txHash: `admin-transfer-${Date.now()}-${fromUserId}-${toUserId}`,
      fromAddress: fromUser.email || 'unknown',
      toAddress: toUser.email || 'unknown',
      value: amountWei,
      type: 'transfer',
      status: 'confirmed',
      fromUser: fromUser._id,
      toUser: toUser._id
    });
    await tx.save();

    await Notification.create({ user: toUser._id, title: 'Incoming transfer', message: `You received ${amountWei} wei from ${fromUser.username}. ${note || ''}` });
    await Notification.create({ user: fromUser._id, title: 'Outgoing transfer', message: `You sent ${amountWei} wei to ${toUser.username}. ${note || ''}` });

    res.json({ success: true, data: { fromUser, toUser, tx } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Send notification to user(s)
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, error: 'Missing title or message' });

    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      const note = await Notification.create({ user: user._id, title, message });
      return res.json({ success: true, data: note });
    }

    // broadcast to all users
    const users = await User.find({});
    const notes = [];
    for (const u of users) {
      notes.push({ user: u._id, title, message });
    }
    await Notification.insertMany(notes);
    res.json({ success: true, message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List notifications for a user (admin can pass userId or fetch all)
exports.listNotifications = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (userId) query.user = userId;

    const notes = await Notification.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Notification.countDocuments(query);
    res.json({ success: true, data: notes, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!note) return res.status(404).json({ success: false, error: 'Notification not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const [totalUsers, newUsersToday, onlineUsers, linkedWallets] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: { $ne: true }, createdAt: { $gte: startOfToday } }),
      User.countDocuments({
        isDeleted: { $ne: true },
        status: 'active',
        lastLoginAt: { $gte: tenMinutesAgo }
      }),
      User.countDocuments({
        isDeleted: { $ne: true },
        walletAddress: { $ne: null }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        onlineUsers,
        linkedWallets
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Đăng ký admin
exports.registerAdmin = async (req, res) => {
  try {
    // Kiểm tra MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB chưa kết nối. Vui lòng kiểm tra cấu hình MONGO_URI trong file backend/.env'
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Thiếu username, email hoặc password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    // Nếu chưa có super_admin, cho phép tạo super_admin đầu tiên
    let role = 'admin';
    if (!existingSuperAdmin) {
      role = 'super_admin';
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Username hoặc email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newAdmin = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role,
      isAdmin: true,
      status: 'active'
    });

    await newAdmin.save();

    // Không trả về password
    const adminData = {
      id: newAdmin._id,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role
    };

    res.status(201).json({ success: true, data: adminData, message: role === 'super_admin' ? 'Super admin đã được tạo thành công' : 'Admin đã được tạo thành công' });
  } catch (err) {
    console.error('Register admin error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Đăng nhập admin
exports.loginAdmin = async (req, res) => {
  try {
    // Kiểm tra MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB chưa kết nối. Vui lòng kiểm tra cấu hình MONGO_URI trong file backend/.env'
      });
    }

    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, error: 'Thiếu email/username hoặc password' });
    }

    const query = emailOrUsername.includes('@')
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername };

    const user = await User.findOne(query);
    if (!user || user.isDeleted || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(401).json({ success: false, error: 'Thông tin đăng nhập không hợp lệ' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, error: 'Tài khoản bị khóa' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Sai mật khẩu' });
    }

    const accessToken = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        tokens: {
          accessToken
        }
      }
    });
  } catch (err) {
    console.error('Login admin error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
