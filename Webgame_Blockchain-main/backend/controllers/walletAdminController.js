const mongoose = require('mongoose');
const WalletUser = require('../models/WalletUser');

function buildSearchQuery({ q }) {
  const filter = {};
  if (q) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [{ walletAddress: regex }];
  }
  return filter;
}

exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, q } = req.query;
    const filter = buildSearchQuery({ q });

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total, totalsAgg, onlineUsers] = await Promise.all([
      WalletUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      WalletUser.countDocuments(filter),
      WalletUser.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalScore: { $sum: '$score' },
            totalPoints: { $sum: '$points' },
            totalCoin: { $sum: '$bomdogCoin' },
            totalLockedCoin: { $sum: '$lockedBomdogCoin' }
          }
        }
      ]),
      WalletUser.countDocuments({
        ...filter,
        lastActive: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      })
    ]);

    const totals = totalsAgg[0] || {};
    const stats = {
      totalUsers: total,
      onlineUsers,
      connectedWallets: total,
      totalScore: totals.totalScore || totals.totalPoints || 0,
      totalPoints: totals.totalPoints || totals.totalScore || 0,
      totalCoin: totals.totalCoin || 0,
      totalLockedCoin: totals.totalLockedCoin || 0
    };

    return res.json({
      success: true,
      data: users,
      stats,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      }
    });
  } catch (err) {
    console.error('listWalletUsers error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user id' });
    }

    const user = await WalletUser.findById(id).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('getWalletUserDetail error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user id' });
    }

    const updates = {};
    if (req.body.status) {
      if (!['active', 'ban'].includes(req.body.status)) {
        return res.status(400).json({ success: false, error: 'Invalid status value' });
      }
      updates.status = req.body.status;
    }
    if (req.body.role) {
      if (!['user', 'admin'].includes(req.body.role)) {
        return res.status(400).json({ success: false, error: 'Invalid role value' });
      }
      updates.role = req.body.role;
    }
    if (req.body.score !== undefined) {
      const parsedScore = Number(req.body.score);
      if (!Number.isFinite(parsedScore) || parsedScore < 0) {
        return res.status(400).json({ success: false, error: 'Score must be >= 0' });
      }
      updates.score = parsedScore;
      updates.points = parsedScore;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }
    if (updates.status) {
      updates.lastActive = new Date();
    }

    const user = await WalletUser.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('updateWalletUser error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user id' });
    }

    const user = await WalletUser.findByIdAndDelete(id).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: { id: user._id } });
  } catch (err) {
    console.error('deleteWalletUser error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user id' });
    }

    const user = await WalletUser.findByIdAndUpdate(
      id,
      { status: 'ban' },
      { new: true }
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('banWalletUser error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user id' });
    }

    const user = await WalletUser.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('unbanWalletUser error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};
