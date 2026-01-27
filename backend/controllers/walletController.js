const economyService = require('../services/walletEconomyService')

function normalizeAddress(address = '') {
  return address.trim().toLowerCase()
}

exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body || {}
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ success: false, error: 'walletAddress is required' })
    }

    const address = normalizeAddress(walletAddress)
    if (!address.startsWith('0x') || address.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' })
    }
    const profile = await economyService.getProfile(address)
    return res.json({ success: true, data: profile })
  } catch (err) {
    console.error('connectWallet error', err)
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, error: err.message || String(err) })
  }
}

exports.getWalletUser = async (req, res) => {
  try {
    const { walletAddress } = req.params
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'walletAddress is required' })
    }

    const address = normalizeAddress(walletAddress)
    const profile = await economyService.getProfile(address)
    return res.json({ success: true, data: profile })
  } catch (err) {
    console.error('getWalletUser error', err)
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, error: err.message || String(err) })
  }
}

exports.handleClick = async (req, res) => {
  try {
    const { walletAddress, increment = 1 } = req.body || {}
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ success: false, error: 'walletAddress is required' })
    }

    const data = await economyService.recordClick({ walletAddress, clicks: increment })
    return res.json({ success: true, data })
  } catch (err) {
    console.error('handleClick error', err)
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, error: err.message || String(err) })
  }
}
