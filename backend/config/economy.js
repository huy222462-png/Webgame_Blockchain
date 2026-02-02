const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

function parseNonNegativeNumber(value, fallback) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
}

function parseMultiplier(value, fallback) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 1) {
    return parsed;
  }
  return fallback;
}

const exchangeRatePoints = parsePositiveInt(process.env.BOMDOG_EXCHANGE_POINTS, 1000);
const exchangeRateCoin = parsePositiveInt(process.env.BOMDOG_EXCHANGE_COIN, 10);
const baseUpgradeCost = parsePositiveInt(process.env.BOMDOG_UPGRADE_BASE_COST, 30);
const upgradeMultiplier = parseMultiplier(process.env.BOMDOG_UPGRADE_MULTIPLIER, 1.5);
const basePointsPerClick = parseNonNegativeNumber(process.env.BOMDOG_CLICK_BASE_POINTS, 25);
const clickMultiplier = parseMultiplier(process.env.BOMDOG_CLICK_POINTS_MULTIPLIER, 1.25);
const baseCoinPerHour = parseNonNegativeNumber(process.env.BOMDOG_IDLE_BASE_COIN, 12);
const idleMultiplier = parseMultiplier(process.env.BOMDOG_IDLE_COIN_MULTIPLIER, 1.2);
const maxIdleHours = parsePositiveInt(process.env.BOMDOG_IDLE_MAX_HOURS, 24);
const minWithdraw = parsePositiveInt(process.env.BOMDOG_MIN_WITHDRAW, 50);
const withdrawConfirmations = parsePositiveInt(process.env.BOMDOG_WITHDRAW_CONFIRMATIONS, 1);
const withdrawGasLimit = parsePositiveInt(process.env.BOMDOG_WITHDRAW_GAS_LIMIT, 220000);
const coinDecimals = parsePositiveInt(process.env.BOMDOG_COIN_DECIMALS, 18);
const withdrawMethodSignature = process.env.BOMDOG_WITHDRAW_METHOD || 'withdraw(address,uint256)';

const rpcUrl = process.env.BOMDOG_RPC_URL || '';
const withdrawerKey = process.env.BOMDOG_WITHDRAWER_KEY || process.env.BOMDOG_PRIVATE_KEY || '';
const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS || '';
let abi;
try {
  abi = process.env.BOMDOG_CONTRACT_ABI
    ? JSON.parse(process.env.BOMDOG_CONTRACT_ABI)
    : [
        'function withdraw(address to, uint256 amount) external',
        'function withdraw(uint256 amount) external'
      ];
} catch (err) {
  console.warn('Invalid BOMDOG_CONTRACT_ABI JSON. Falling back to default withdraw signatures.');
  abi = [
    'function withdraw(address to, uint256 amount) external',
    'function withdraw(uint256 amount) external'
  ];
}

const pointsPerCoin = exchangeRateCoin > 0 ? exchangeRatePoints / exchangeRateCoin : 100;

function getPointsPerClick(level = 1) {
  const sanitizedLevel = Math.max(1, Number(level) || 1);
  const points = basePointsPerClick * Math.pow(clickMultiplier, sanitizedLevel - 1);
  return Math.round(points);
}

function getCoinPerClick(level = 1) {
  const perCoin = pointsPerCoin > 0 ? getPointsPerClick(level) / pointsPerCoin : 0;
  return Math.round(perCoin * 100) / 100;
}

function getCoinPerHour(level = 1) {
  const sanitizedLevel = Math.max(1, Number(level) || 1);
  const coins = baseCoinPerHour * Math.pow(idleMultiplier, sanitizedLevel - 1);
  return Math.round(coins * 100) / 100;
}

function getUpgradeCost(level = 1) {
  const sanitizedLevel = Math.max(1, Number(level) || 1);
  const price = baseUpgradeCost * Math.pow(upgradeMultiplier, sanitizedLevel - 1);
  return Math.max(1, Math.round(price));
}

function getEconomyConfig() {
  return {
    exchangeRatePoints,
    exchangeRateCoin,
    pointsPerCoin,
    baseUpgradeCost,
    upgradeMultiplier,
    basePointsPerClick,
    clickMultiplier,
    baseCoinPerHour,
    idleMultiplier,
    maxIdleHours,
    minWithdraw,
    coinDecimals,
    withdrawConfirmations,
    withdrawGasLimit,
    withdrawMethodSignature
  };
}

function getWithdrawConfig() {
  return {
    minWithdraw,
    rpcUrl,
    withdrawerKey,
    contractAddress,
    abi,
    coinDecimals,
    withdrawConfirmations,
    withdrawGasLimit,
    methodSignature: withdrawMethodSignature
  };
}

module.exports = {
  getEconomyConfig,
  getWithdrawConfig,
  getPointsPerClick,
  getCoinPerClick,
  getCoinPerHour,
  getUpgradeCost,
  pointsPerCoin,
  exchangeRatePoints,
  exchangeRateCoin,
  maxIdleHours,
  minWithdraw
};
