const mongoose = require('mongoose');
const { ethers } = require('ethers');
const WalletUser = require('../models/WalletUser');
const ExchangeHistory = require('../models/ExchangeHistory');
const UpgradeHistory = require('../models/UpgradeHistory');
const WithdrawHistory = require('../models/WithdrawHistory');
const { performHederaWithdraw } = require('./hederaWithdrawService');
const {
  getEconomyConfig,
  getWithdrawConfig,
  getPointsPerClick,
  getCoinPerClick,
  getCoinPerHour,
  getUpgradeCost,
  exchangeRatePoints,
  exchangeRateCoin,
  maxIdleHours,
  minWithdraw,
  pointsPerCoin
} = require('../config/economy');

const EXCHANGE_POINTS = exchangeRatePoints;
const EXCHANGE_COIN = exchangeRateCoin;

function normalizeAddress(address = '') {
  if (typeof address !== 'string') {
    return '';
  }
  return address.trim().toLowerCase();
}

function assertWalletAddress(address) {
  if (!address) {
    const error = new Error('walletAddress is required');
    error.statusCode = 400;
    throw error;
  }
  
  // Check if Ethereum address (0x...) or Hedera Account ID (0.0.xxxxx)
  const isEthAddress = address.startsWith('0x') && address.length >= 40;
  const isHederaId = /^0\.0\.\d+$/.test(address);
  
  if (!isEthAddress && !isHederaId) {
    const error = new Error('Invalid wallet address. Expected Ethereum (0x...) or Hedera Account ID (0.0.xxxxx)');
    error.statusCode = 400;
    throw error;
  }
}

async function findOrCreateUser(address, session) {
  const now = new Date();
  const query = WalletUser.findOneAndUpdate(
    { walletAddress: address },
    {
      $setOnInsert: {
        score: 0,
        points: 0,
        bomdogCoin: 0,
        lockedBomdogCoin: 0,
        clickLevel: 1,
        idleLevel: 1,
        lastClaimTime: now,
        role: 'user',
        status: 'active'
      },
      $set: {
        lastActive: now
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      session
    }
  );
  return query.exec();
}

function buildUserPayload(userDoc, extras = {}) {
  if (!userDoc) return null;
  const config = getEconomyConfig();
  const clickLevel = userDoc.clickLevel || 1;
  const idleLevel = userDoc.idleLevel || 1;
  const payload = {
    walletAddress: userDoc.walletAddress,
    points: userDoc.points || 0,
    score: userDoc.points || 0,
    bomdogCoin: userDoc.bomdogCoin || 0,
    lockedBomdogCoin: userDoc.lockedBomdogCoin || 0,
    clickLevel,
    idleLevel,
    lastClaimTime: userDoc.lastClaimTime,
    status: userDoc.status,
    lastActive: userDoc.lastActive,
    pointsPerClick: getPointsPerClick(clickLevel),
    coinPerClick: getCoinPerClick(clickLevel),
    coinPerHour: getCoinPerHour(idleLevel),
    exchangeRate: {
      points: EXCHANGE_POINTS,
      coin: EXCHANGE_COIN,
      pointsPerCoin: pointsPerCoin
    },
    upgrade: {
      nextClickCost: getUpgradeCost(clickLevel),
      nextIdleCost: getUpgradeCost(idleLevel)
    },
    config
  };
  return { ...payload, ...extras };
}

async function applyIdleRewards(userDoc) {
  const now = new Date();
  const lastClaim = userDoc.lastClaimTime ? new Date(userDoc.lastClaimTime) : null;
  if (!lastClaim) {
    userDoc.lastClaimTime = now;
    return { idleEarned: 0 };
  }

  const elapsedMs = now.getTime() - lastClaim.getTime();
  if (elapsedMs <= 0) {
    return { idleEarned: 0 };
  }

  const cappedMs = Math.min(elapsedMs, maxIdleHours * 60 * 60 * 1000);
  if (cappedMs <= 0) {
    return { idleEarned: 0 };
  }

  const hours = cappedMs / (60 * 60 * 1000);
  const coinsPerHour = getCoinPerHour(userDoc.idleLevel || 1);
  const earned = Math.floor(hours * coinsPerHour);

  if (earned <= 0) {
    return { idleEarned: 0 };
  }

  userDoc.bomdogCoin += earned;
  userDoc.lastClaimTime = now;
  return { idleEarned: earned };
}

async function runInTransaction(callback) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

async function ensureActiveUser(userDoc) {
  if (!userDoc) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  if (userDoc.status === 'ban' || userDoc.status === 'banned') {
    const error = new Error('User is banned');
    error.statusCode = 403;
    throw error;
  }
}

async function exchangePoints({ walletAddress, pointsToExchange }) {
  const address = normalizeAddress(walletAddress);
  assertWalletAddress(address);

  const parsedPoints = Number(pointsToExchange);
  if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
    const error = new Error('pointsToExchange must be > 0');
    error.statusCode = 400;
    throw error;
  }
  if (parsedPoints % EXCHANGE_POINTS !== 0) {
    const error = new Error(`pointsToExchange must be multiple of ${EXCHANGE_POINTS}`);
    error.statusCode = 400;
    throw error;
  }

  return runInTransaction(async (session) => {
    const user = await findOrCreateUser(address, session);
    await ensureActiveUser(user);
    const { idleEarned } = await applyIdleRewards(user);

    if (user.points < parsedPoints) {
      const error = new Error('Insufficient points');
      error.statusCode = 400;
      throw error;
    }

    const coins = Math.floor((parsedPoints / EXCHANGE_POINTS) * EXCHANGE_COIN);
    if (coins <= 0) {
      const error = new Error('Exchange amount too small');
      error.statusCode = 400;
      throw error;
    }

    user.points -= parsedPoints;
    user.bomdogCoin += coins;
    user.score = user.points;
    await user.save({ session });

    await ExchangeHistory.create([
      {
        walletAddress: address,
        pointsSpent: parsedPoints,
        coinReceived: coins
      }
    ], { session });

    return buildUserPayload(user, { idleEarned, exchangedCoin: coins, exchangedPoints: parsedPoints });
  });
}

async function recordClick({ walletAddress, clicks = 1 }) {
  const address = normalizeAddress(walletAddress);
  assertWalletAddress(address);

  const parsedClicks = Number(clicks);
  if (!Number.isFinite(parsedClicks) || parsedClicks <= 0) {
    const error = new Error('increment must be > 0');
    error.statusCode = 400;
    throw error;
  }

  return runInTransaction(async (session) => {
    const user = await findOrCreateUser(address, session);
    await ensureActiveUser(user);
    const { idleEarned } = await applyIdleRewards(user);

    const perClickPoints = getPointsPerClick(user.clickLevel || 1);
    const totalPoints = perClickPoints * parsedClicks;
    user.points += totalPoints;
    user.score = user.points;
    user.lastActive = new Date();

    await user.save({ session });

    return buildUserPayload(user, {
      idleEarned,
      pointsEarned: totalPoints,
      clicksProcessed: parsedClicks
    });
  });
}

async function upgrade({ walletAddress, upgradeType }) {
  const address = normalizeAddress(walletAddress);
  assertWalletAddress(address);

  if (!['click', 'idle'].includes(upgradeType)) {
    const error = new Error('upgradeType must be click or idle');
    error.statusCode = 400;
    throw error;
  }

  return runInTransaction(async (session) => {
    const user = await findOrCreateUser(address, session);
    await ensureActiveUser(user);
    const { idleEarned } = await applyIdleRewards(user);

    const currentLevel = upgradeType === 'click' ? (user.clickLevel || 1) : (user.idleLevel || 1);
    const cost = getUpgradeCost(currentLevel);
    if (user.bomdogCoin < cost) {
      const error = new Error('Insufficient Bomdog coin');
      error.statusCode = 400;
      throw error;
    }

    user.bomdogCoin -= cost;
    if (upgradeType === 'click') {
      user.clickLevel = currentLevel + 1;
    } else {
      user.idleLevel = currentLevel + 1;
    }
    await user.save({ session });

    await UpgradeHistory.create([
      {
        walletAddress: address,
        type: upgradeType,
        levelBefore: currentLevel,
        levelAfter: currentLevel + 1,
        coinCost: cost
      }
    ], { session });

    const extra = {
      idleEarned,
      upgradeCost: cost,
      upgradedType: upgradeType,
      levelBefore: currentLevel,
      levelAfter: currentLevel + 1
    };
    return buildUserPayload(user, extra);
  });
}

let cachedContractKey = null;
let cachedContract = null;

function getWithdrawContract() {
  const config = getWithdrawConfig();
  const key = [config.rpcUrl, config.contractAddress, config.withdrawerKey].join('|');
  if (!config.rpcUrl || !config.contractAddress || !config.withdrawerKey) {
    const error = new Error('Withdraw contract not configured');
    error.statusCode = 500;
    throw error;
  }
  if (!cachedContract || cachedContractKey !== key) {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.withdrawerKey, provider);
    cachedContract = new ethers.Contract(config.contractAddress, config.abi, wallet);
    cachedContractKey = key;
  }
  return { contract: cachedContract, config };
}

async function performWithdrawOnChain(targetAddress, amount, preferredNetwork = 'auto') {
  // Detect network from target address if not specified
  const isHederaAddress = /^0\.0\.\d+$/.test(targetAddress);
  const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(targetAddress);
  
  if (!isHederaAddress && !isEthAddress) {
    throw new Error('Invalid target address format. Expected Ethereum (0x...) or Hedera (0.0.xxxxx)');
  }

  // Determine which network to use
  let useHedera = false;
  
  if (preferredNetwork === 'hedera' || (preferredNetwork === 'auto' && isHederaAddress)) {
    // Check if Hedera is configured
    useHedera = process.env.BOMDOG_HEDERA_ACCOUNT_ID && process.env.BOMDOG_HEDERA_TOKEN_ID;
    
    if (!useHedera && preferredNetwork === 'hedera') {
      throw new Error('Hedera network requested but not configured');
    }
  } else if (preferredNetwork === 'ethereum' || (preferredNetwork === 'auto' && isEthAddress)) {
    useHedera = false;
  }
  
  if (useHedera) {
    // Dùng Hedera
    if (!isHederaAddress) {
      throw new Error('Hedera network selected but target address is not a Hedera Account ID');
    }
    console.log('🔷 Using Hedera Network for withdrawal');
    console.log(`   Target: ${targetAddress} | Amount: ${amount} BOMDOG`);
    const result = await performHederaWithdraw(targetAddress, amount);
    return { 
      txHash: result.txId, 
      receipt: result.receipt,
      network: 'hedera',
      targetAddress
    };
  } else {
    // Dùng Ethereum (code cũ)
    if (!isEthAddress) {
      throw new Error('Ethereum network selected but target address is not an Ethereum address');
    }
    console.log('⬣ Using Ethereum/EVM Network for withdrawal');
    console.log(`   Target: ${targetAddress} | Amount: ${amount} BOMDOG`);
    const { contract, config } = getWithdrawContract();
    console.log(`   Method: ${config.methodSignature}`);
    const scaledAmount = ethers.parseUnits(amount.toString(), config.coinDecimals);
    const args = config.methodSignature.includes('address') ? [targetAddress, scaledAmount] : [scaledAmount];
    const fn = contract.getFunction(config.methodSignature);
    const overrides = config.withdrawGasLimit ? { gasLimit: BigInt(config.withdrawGasLimit) } : undefined;
    const txResponse = overrides ? await fn(...args, overrides) : await fn(...args);
    const receipt = await txResponse.wait(config.withdrawConfirmations);
    return { 
      txHash: receipt?.hash || txResponse.hash, 
      receipt,
      network: 'ethereum',
      targetAddress
    };
  }
}

async function withdraw({ walletAddress, amount, targetAddress, preferredNetwork }) {
  const address = normalizeAddress(walletAddress);
  assertWalletAddress(address);

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const error = new Error('amount must be > 0');
    error.statusCode = 400;
    throw error;
  }
  if (parsedAmount < minWithdraw) {
    const error = new Error(`Minimum withdraw is ${minWithdraw}`);
    error.statusCode = 400;
    throw error;
  }

  // Determine target address and network
  const finalTargetAddress = targetAddress || address;
  const isHederaAddress = /^0\.0\.\d+$/.test(finalTargetAddress);
  const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(finalTargetAddress);
  
  if (!isHederaAddress && !isEthAddress) {
    const error = new Error('Invalid target address format. Expected Ethereum (0x...) or Hedera (0.0.xxxxx)');
    error.statusCode = 400;
    throw error;
  }

  // Detect network
  let detectedNetwork = 'ethereum';
  if (preferredNetwork === 'hedera' || (preferredNetwork === 'auto' && isHederaAddress)) {
    detectedNetwork = 'hedera';
  } else if (preferredNetwork === 'ethereum' || (preferredNetwork === 'auto' && isEthAddress)) {
    detectedNetwork = 'ethereum';
  } else {
    detectedNetwork = isHederaAddress ? 'hedera' : 'ethereum';
  }

  let withdrawDoc;
  await runInTransaction(async (session) => {
    const user = await findOrCreateUser(address, session);
    await ensureActiveUser(user);
    await applyIdleRewards(user);

    const pending = await WithdrawHistory.findOne({ walletAddress: address, status: 'pending' }).session(session);
    if (pending) {
      const error = new Error('Existing withdraw in progress');
      error.statusCode = 409;
      throw error;
    }

    if (user.bomdogCoin < parsedAmount) {
      const error = new Error('Insufficient Bomdog coin');
      error.statusCode = 400;
      throw error;
    }

    user.bomdogCoin -= parsedAmount;
    user.lockedBomdogCoin = (user.lockedBomdogCoin || 0) + parsedAmount;
    await user.save({ session });

    const [doc] = await WithdrawHistory.create([
      {
        walletAddress: address,
        targetAddress: finalTargetAddress,
        network: detectedNetwork,
        amount: parsedAmount,
        status: 'pending'
      }
    ], { session });
    withdrawDoc = doc;
  });

  const [latestUser, pending] = await Promise.all([
    WalletUser.findOne({ walletAddress: address }).lean(),
    WithdrawHistory.findById(withdrawDoc._id).lean()
  ]);

  return {
    ...buildUserPayload(latestUser, {
      pendingWithdraw: pending,
      withdrawStatus: pending?.status || 'pending'
    }),
    pendingRequestId: pending?._id,
    network: detectedNetwork,
    targetAddress: finalTargetAddress
  };
}

async function getProfile(walletAddress) {
  const address = normalizeAddress(walletAddress);
  assertWalletAddress(address);

  return runInTransaction(async (session) => {
    const user = await findOrCreateUser(address, session);
    const { idleEarned } = await applyIdleRewards(user);
    await user.save({ session });
    return buildUserPayload(user, { idleEarned });
  });
}

async function listWithdrawRequests({ status, page, limit }) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const [requests, total, statusSummary] = await Promise.all([
    WithdrawHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    WithdrawHistory.countDocuments(filter),
    WithdrawHistory.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ])
  ]);

  const addressSet = Array.from(new Set(requests.map((item) => item.walletAddress))).filter(Boolean);
  const users = addressSet.length
    ? await WalletUser.find({ walletAddress: { $in: addressSet } }).lean()
    : [];
  const userMap = new Map(users.map((u) => [u.walletAddress, u]));

  const items = requests.map((req) => ({
    ...req,
    user: userMap.has(req.walletAddress)
      ? buildUserPayload(userMap.get(req.walletAddress))
      : null
  }));

  const summary = statusSummary.reduce((acc, entry) => {
    acc[entry._id] = {
      count: entry.count,
      totalAmount: entry.totalAmount
    };
    return acc;
  }, {});

  return {
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total
    },
    summary
  };
}

async function reviewWithdrawRequest({ requestId, approve, note, adminId }) {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    const error = new Error('Invalid request id');
    error.statusCode = 400;
    throw error;
  }

  let requestSnapshot = null;
  if (!approve) {
    let result;
    await runInTransaction(async (session) => {
      const request = await WithdrawHistory.findById(requestId).session(session);
      if (!request) {
        throw new Error('Withdraw request not found');
      }
      if (request.status !== 'pending') {
        throw new Error('Request already processed');
      }

      const user = await WalletUser.findOne({ walletAddress: request.walletAddress }).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      user.bomdogCoin += request.amount;
      user.lockedBomdogCoin = Math.max(0, (user.lockedBomdogCoin || 0) - request.amount);
      await user.save({ session });

      request.status = 'rejected';
      request.reviewNote = note || null;
      request.reviewedBy = adminId || null;
      request.reviewedAt = new Date();
      request.completedAt = new Date();
      await request.save({ session, validateModifiedOnly: true });

      result = {
        request: request.toObject(),
        user: buildUserPayload(user)
      };
    });
    return result;
  }

  let latestUserPayload = null;
  await runInTransaction(async (session) => {
    const request = await WithdrawHistory.findById(requestId).session(session);
    if (!request) {
      throw new Error('Withdraw request not found');
    }
    if (request.status !== 'pending') {
      throw new Error('Request already processed');
    }

    const user = await WalletUser.findOne({ walletAddress: request.walletAddress }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if ((user.lockedBomdogCoin || 0) < request.amount) {
      throw new Error('Locked balance insufficient');
    }

    request.status = 'processing';
    request.reviewNote = note || null;
    request.reviewedBy = adminId || null;
    request.reviewedAt = new Date();
    await request.save({ session, validateModifiedOnly: true });

    requestSnapshot = request.toObject();
  });

  try {
    // Use the network and target address saved in the request
    const targetAddr = requestSnapshot.targetAddress || requestSnapshot.walletAddress;
    
    // Handle old requests without network field
    let networkPref = requestSnapshot.network;
    if (!networkPref || networkPref === null) {
      // Auto-detect from address for old requests
      const isHederaAddr = /^0\.0\.\d+$/.test(targetAddr);
      networkPref = isHederaAddr ? 'hedera' : 'auto';
      console.log(`⚠️  Old request without network field. Auto-detected: ${networkPref}`);
    }
    
    console.log(`\n🔐 Admin approved withdrawal:`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   Amount: ${requestSnapshot.amount} BOMDOG`);
    console.log(`   Network: ${networkPref}`);
    console.log(`   Target: ${targetAddr}\n`);
    
    const onChainResult = await performWithdrawOnChain(targetAddr, requestSnapshot.amount, networkPref);

    await runInTransaction(async (session) => {
      const request = await WithdrawHistory.findById(requestId).session(session);
      const user = await WalletUser.findOne({ walletAddress: requestSnapshot.walletAddress }).session(session);
      if (!request || !user) {
        throw new Error('Request or user missing after approval');
      }

      user.lockedBomdogCoin = Math.max(0, (user.lockedBomdogCoin || 0) - requestSnapshot.amount);
      await user.save({ session });

      request.status = 'completed';
      request.txHash = onChainResult.txHash;
      request.completedAt = new Date();
      
      // Update network and targetAddress if available
      if (onChainResult.network) {
        request.network = onChainResult.network;
      }
      if (onChainResult.targetAddress) {
        request.targetAddress = onChainResult.targetAddress;
      }
      
      await request.save({ session, validateModifiedOnly: true });

      latestUserPayload = buildUserPayload(user, {
        withdrawnAmount: requestSnapshot.amount
      });
      requestSnapshot = request.toObject();
    });

    console.log(`✅ Withdrawal completed successfully!`);
    console.log(`   TX Hash: ${requestSnapshot.txHash}`);
    console.log(`   Network: ${requestSnapshot.network}\n`);

    return {
      request: requestSnapshot,
      user: latestUserPayload,
      txHash: requestSnapshot.txHash,
      network: requestSnapshot.network
    };
  } catch (err) {
    console.error(`❌ Withdrawal failed:`, err.message);
    
    await runInTransaction(async (session) => {
      const request = await WithdrawHistory.findById(requestId).session(session);
      const user = await WalletUser.findOne({ walletAddress: requestSnapshot.walletAddress }).session(session);
      if (request) {
        request.status = 'failed';
        request.failureReason = err.message || String(err);
        request.completedAt = new Date();
        await request.save({ session, validateModifiedOnly: true });
      }
      if (user) {
        user.bomdogCoin += requestSnapshot.amount;
        user.lockedBomdogCoin = Math.max(0, (user.lockedBomdogCoin || 0) - requestSnapshot.amount);
        await user.save({ session });
      }
    });

    const error = new Error(`Withdraw failed: ${err.message || String(err)}`);
    error.statusCode = 502;
    error.originalError = err;
    throw error;
  }
}

module.exports = {
  recordClick,
  exchangePoints,
  upgrade,
  withdraw,
  getProfile,
  listWithdrawRequests,
  reviewWithdrawRequest
};
