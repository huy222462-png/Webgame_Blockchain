const mongoose = require('mongoose');
const User = require('../models/User');
const AdminConfig = require('../models/AdminConfig');
const GameTransaction = require('../models/GameTransaction');
const WithdrawRequest = require('../models/WithdrawRequest');

async function getOrCreateConfig(session) {
  const query = AdminConfig.findOne();
  if (session) {
    query.session(session);
  }
  let config = await query.exec();
  if (!config) {
    const createOptions = session ? { session } : undefined;
    const [created] = await AdminConfig.create([
      {
        conversionRate: { points: 1000, currency: 10 },
        baseUpgradeCost: 30,
        upgradeMultiplier: 1.2
      }
    ], createOptions);
    config = created;
  }
  return config;
}

function calcUpgradePrice(config, currentLevel) {
  const base = config?.baseUpgradeCost ?? 30;
  const multiplier = config?.upgradeMultiplier ?? 1.2;
  const price = base * Math.pow(multiplier, currentLevel || 0);
  return Math.max(1, Math.round(price));
}

async function convertPoints({ adminId, userId, pointsToConvert }) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }
  const parsedPoints = Number(pointsToConvert);
  if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
    throw new Error('points must be > 0');
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const config = await getOrCreateConfig(session);
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      if (parsedPoints > user.totalPoints) {
        throw new Error('Insufficient points');
      }

      const ratePoints = config.conversionRate?.points || 1000;
      const rateCurrency = config.conversionRate?.currency || 10;
      if (ratePoints <= 0) {
        throw new Error('Conversion rate invalid');
      }

      const currencyPerPoint = rateCurrency / ratePoints;
      const currencyAmount = Math.floor(parsedPoints * currencyPerPoint);
      if (currencyAmount <= 0) {
        throw new Error('Conversion amount too small');
      }

      const beforePoints = user.totalPoints;
      const beforeBalance = user.gameBalance;

      user.totalPoints -= parsedPoints;
      user.gameBalance += currencyAmount;
      await user.save({ session });

      const txPayload = {
        user: user._id,
        type: 'convert',
        amount: currencyAmount,
        balanceBefore: beforeBalance,
        balanceAfter: user.gameBalance,
        pointsBefore: beforePoints,
        pointsAfter: user.totalPoints,
        metadata: {
          adminId,
          pointsConverted: parsedPoints
        }
      };
      if (mongoose.Types.ObjectId.isValid(adminId)) {
        txPayload.createdBy = adminId;
      }

      await GameTransaction.create([txPayload], { session });

      result = {
        balance: user.gameBalance,
        totalPoints: user.totalPoints,
        conversionRate: config.conversionRate
      };
    });
  } finally {
    session.endSession();
  }
  return result;
}

async function upgradePlayer({ userId }) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const config = await getOrCreateConfig(session);
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const price = calcUpgradePrice(config, user.upgradeLevel);
      if (user.gameBalance < price) {
        throw new Error('Insufficient balance');
      }

      const beforeBalance = user.gameBalance;
      user.gameBalance -= price;
      user.upgradeLevel += 1;
      await user.save({ session });

      await GameTransaction.create([
        {
          user: user._id,
          type: 'upgrade',
          amount: price,
          balanceBefore: beforeBalance,
          balanceAfter: user.gameBalance,
          pointsBefore: user.totalPoints,
          pointsAfter: user.totalPoints,
          metadata: {
            level: user.upgradeLevel,
            price,
            upgradeMultiplier: config.upgradeMultiplier
          },
          createdBy: user._id
        }
      ], { session });

      result = {
        balance: user.gameBalance,
        upgradeLevel: user.upgradeLevel,
        priceCharged: price
      };
    });
  } finally {
    session.endSession();
  }
  return result;
}

async function requestWithdraw({ userId, amount }) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Amount must be > 0');
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      if (parsedAmount > user.gameBalance) {
        throw new Error('Insufficient balance');
      }

      const [request] = await WithdrawRequest.create([
        { user: user._id, amount: parsedAmount }
      ], { session });

      result = request.toObject();
    });
  } finally {
    session.endSession();
  }
  return result;
}

async function reviewWithdraw({ adminId, requestId, approve, note }) {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new Error('Invalid requestId');
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const request = await WithdrawRequest.findById(requestId).session(session);
      if (!request) {
        throw new Error('Withdraw request not found');
      }
      if (request.status !== 'pending') {
        throw new Error('Request already processed');
      }

      const user = await User.findById(request.user).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      let txDoc = null;
      if (approve) {
        if (user.gameBalance < request.amount) {
          throw new Error('Insufficient balance');
        }
        const beforeBalance = user.gameBalance;
        user.gameBalance -= request.amount;
        await user.save({ session });

        request.status = 'approved';
        if (mongoose.Types.ObjectId.isValid(adminId)) {
          request.reviewedBy = adminId;
        } else {
          request.reviewedBy = undefined;
        }
        request.reviewedAt = new Date();
        request.note = note;
        await request.save({ session });

        const txData = {
          user: user._id,
          type: 'withdraw',
          amount: request.amount,
          balanceBefore: beforeBalance,
          balanceAfter: user.gameBalance,
          metadata: {
            requestId: request._id,
            status: 'approved',
            adminId,
            note
          }
        };
        if (mongoose.Types.ObjectId.isValid(adminId)) {
          txData.createdBy = adminId;
        }

        const [tx] = await GameTransaction.create([txData], { session });
        txDoc = tx.toObject();
      } else {
        request.status = 'rejected';
        if (mongoose.Types.ObjectId.isValid(adminId)) {
          request.reviewedBy = adminId;
        } else {
          request.reviewedBy = undefined;
        }
        request.reviewedAt = new Date();
        request.note = note;
        await request.save({ session });
      }

      result = {
        request: request.toObject(),
        transaction: txDoc
      };
    });
  } finally {
    session.endSession();
  }
  return result;
}

module.exports = {
  calcUpgradePrice,
  getOrCreateConfig,
  convertPoints,
  upgradePlayer,
  requestWithdraw,
  reviewWithdraw
};
