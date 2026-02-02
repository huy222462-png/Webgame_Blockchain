const economyService = require('../services/walletEconomyService');

function handleError(res, err) {
  const status = err.statusCode || 500;
  return res.status(status).json({ success: false, error: err.message || String(err) });
}

exports.listWithdrawRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const data = await economyService.listWithdrawRequests({ status, page, limit });
    return res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.reviewWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, note } = req.body || {};
    const approveFlag = approve === true || approve === 'true' || approve === 1 || approve === '1';
    const adminId = req.user?.id || req.user?._id || null;
    const data = await economyService.reviewWithdrawRequest({
      requestId: id,
      approve: approveFlag,
      note,
      adminId
    });
    return res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
};
