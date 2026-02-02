const mongoose = require('mongoose');
const User = require('../models/User');
const WithdrawRequest = require('../models/WithdrawRequest');
const {
  calcUpgradePrice,
  getOrCreateConfig,
  convertPoints,
  upgradePlayer,
  requestWithdraw,
  reviewWithdraw
} = require('../services/gameEconomyService');

function ensureAdmin(req) {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const hasAdminKey = adminKey && adminKey === process.env.ADMIN_KEY;
  if (hasAdminKey) return;

  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    const error = new Error('Forbidden: admin only');
    error.statusCode = 403;
    throw error;
  }
}

function resolveRequesterId(req) {
  if (!req.user) return null;
  if (req.user.id) return req.user.id;
  if (req.user._id) {
    return typeof req.user._id === 'string' ? req.user._id : req.user._id.toString();
  }
  return null;
}

exports.listPlayers = async (req, res) => {
  try {
    ensureAdmin(req);
    const { page = 1, limit = 20, q } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {
      isDeleted: { $ne: true },
      role: { $ne: 'super_admin' }
    };
    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { username: regex },
        { email: regex },
        { walletAddress: regex }
      ];
    }

    const [players, total, aggregates, config] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      User.countDocuments(filter),
      User.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: '$totalPoints' },
            totalBalance: { $sum: '$gameBalance' }
          }
        }
      ]),
      getOrCreateConfig()
    ]);

    const totals = aggregates[0] || { totalPoints: 0, totalBalance: 0 };
    const data = players.map((player) => ({
      id: player._id,
      username: player.username,
      email: player.email,
      role: player.role,
      totalPoints: player.totalPoints,
      balance: player.gameBalance,
      upgradeLevel: player.upgradeLevel,
      nextUpgradePrice: calcUpgradePrice(config, player.upgradeLevel)
    }));

    return res.json({
      success: true,
      data,
      stats: {
        totalUsers: total,
        totalPoints: totals.totalPoints || 0,
        totalBalance: totals.totalBalance || 0,
        conversionRate: config.conversionRate
      },
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total
      }
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.adminConvertPoints = async (req, res) => {
  try {
    ensureAdmin(req);
    const { userId, points } = req.body || {};
    const result = await convertPoints({
      adminId: resolveRequesterId(req),
      userId,
      pointsToConvert: points
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.getAdminConfig = async (req, res) => {
  try {
    ensureAdmin(req);
    const config = await getOrCreateConfig();
    return res.json({ success: true, data: config });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.updateAdminConfig = async (req, res) => {
  try {
    ensureAdmin(req);
    const {
      conversionPoints,
      conversionCurrency,
      baseUpgradeCost,
      upgradeMultiplier
    } = req.body || {};

    const session = await mongoose.startSession();
    let config;
    try {
      await session.withTransaction(async () => {
        config = await getOrCreateConfig(session);
        if (conversionPoints !== undefined || conversionCurrency !== undefined) {
          const pointsValue = conversionPoints !== undefined ? Number(conversionPoints) : config.conversionRate.points;
          const currencyValue = conversionCurrency !== undefined ? Number(conversionCurrency) : config.conversionRate.currency;
          if (!Number.isFinite(pointsValue) || pointsValue <= 0) {
            throw new Error('conversionPoints must be > 0');
          }
          if (!Number.isFinite(currencyValue) || currencyValue < 0) {
            throw new Error('conversionCurrency must be >= 0');
          }
          config.conversionRate = {
            points: pointsValue,
            currency: currencyValue
          };
        }
        if (baseUpgradeCost !== undefined) {
          const parsed = Number(baseUpgradeCost);
          if (!Number.isFinite(parsed) || parsed < 0) {
            throw new Error('baseUpgradeCost must be >= 0');
          }
          config.baseUpgradeCost = parsed;
        }
        if (upgradeMultiplier !== undefined) {
          const parsed = Number(upgradeMultiplier);
          if (!Number.isFinite(parsed) || parsed < 1) {
            throw new Error('upgradeMultiplier must be >= 1');
          }
          config.upgradeMultiplier = parsed;
        }
        const requesterId = resolveRequesterId(req);
        if (mongoose.Types.ObjectId.isValid(requesterId)) {
          config.updatedBy = requesterId;
        } else {
          config.updatedBy = undefined;
        }
        await config.save({ session });
      });
    } finally {
      session.endSession();
    }

    return res.json({ success: true, data: config });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.getPlayerProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    const [user, config] = await Promise.all([
      User.findById(req.user.id).lean(),
      getOrCreateConfig()
    ]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        totalPoints: user.totalPoints,
        balance: user.gameBalance,
        upgradeLevel: user.upgradeLevel,
        nextUpgradePrice: calcUpgradePrice(config, user.upgradeLevel),
        conversionRate: config.conversionRate
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.playerUpgrade = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    const result = await upgradePlayer({ userId: req.user.id });
    return res.json({ success: true, data: result });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.playerWithdraw = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    const { amount } = req.body || {};
    const request = await requestWithdraw({ userId: req.user.id, amount });
    return res.json({ success: true, data: request });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.listWithdrawRequests = async (req, res) => {
  try {
    ensureAdmin(req);
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const [requests, total] = await Promise.all([
      WithdrawRequest.find(filter)
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate('user', 'username email')
        .populate('reviewedBy', 'username email')
        .lean(),
      WithdrawRequest.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: requests,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total
      }
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
};

exports.reviewWithdrawRequest = async (req, res) => {
  try {
    ensureAdmin(req);
    const { id } = req.params;
    const { approve, note } = req.body || {};
    const parsedApprove = approve === true || approve === 'true';
    const result = await reviewWithdraw({
      adminId: resolveRequesterId(req),
      requestId: id,
      approve: parsedApprove,
      note
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ success: false, error: err.message });
  }
};
