const express = require('express');
const router = express.Router();
const ethers = require('ethers');

// POST /api/auth/verify
// body: { address, message, signature }
router.post('/verify', async (req, res) => {
  const { address, message, signature } = req.body;
  if(!address || !message || !signature){
    return res.status(400).json({ success: false, error: 'Missing address/message/signature' });
  }
  try{
    // recover address from signed message
    const recovered = ethers.utils.verifyMessage(message, signature);
    const match = recovered.toLowerCase() === address.toLowerCase();
    return res.json({ success: match, recovered, match });
  }catch(err){
    console.error('Verify error', err);
    return res.status(500).json({ success:false, error: err.message || String(err) });
  }
});

module.exports = router;
