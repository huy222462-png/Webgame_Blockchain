const economyService = require('../services/walletEconomyService');

function handleSuccess(res, data) {
  return res.json({ success: true, data });
}

function handleError(res, err) {
  const status = err.statusCode || 500;
  return res.status(status).json({ success: false, error: err.message || String(err) });
}

exports.getProfile = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const data = await economyService.getProfile(walletAddress);
    return handleSuccess(res, data);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.exchangePoints = async (req, res) => {
  try {
    const { walletAddress, pointsToExchange } = req.body || {};
    const data = await economyService.exchangePoints({ walletAddress, pointsToExchange });
    return handleSuccess(res, data);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.upgrade = async (req, res) => {
  try {
    const { walletAddress, upgradeType } = req.body || {};
    const data = await economyService.upgrade({ walletAddress, upgradeType });
    return handleSuccess(res, data);
  } catch (err) {
    return handleError(res, err);
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { walletAddress, amount } = req.body || {};
    const data = await economyService.withdraw({ walletAddress, amount });
    return handleSuccess(res, data);
  } catch (err) {
    return handleError(res, err);
  }
};
