const Leaderboard = require('../models/Leaderboard');

// Get top players
exports.getTopPlayers = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const topPlayers = await Leaderboard.find()
      .sort({ totalWon: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: topPlayers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get player rank
exports.getPlayerRank = async (req, res) => {
  try {
    const { address } = req.params;
    
    const player = await Leaderboard.findOne({ 
      playerAddress: address.toLowerCase() 
    });
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        error: 'Player not found' 
      });
    }
    
    res.json({ success: true, data: player });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update player name
exports.updatePlayerName = async (req, res) => {
  try {
    const { address } = req.params;
    const { name } = req.body;
    
    let player = await Leaderboard.findOne({ 
      playerAddress: address.toLowerCase() 
    });
    
    if (!player) {
      player = new Leaderboard({ 
        playerAddress: address.toLowerCase() 
      });
    }
    
    player.playerName = name;
    await player.save();
    
    res.json({ success: true, data: player });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
