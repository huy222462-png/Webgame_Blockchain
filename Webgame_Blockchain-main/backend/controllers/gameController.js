const GameHistory = require('../models/GameHistory');
const Leaderboard = require('../models/Leaderboard');

// Get player game history
exports.getPlayerHistory = async (req, res) => {
  try {
    const { address } = req.params;
    const { gameType, limit = 50, page = 1 } = req.query;
    
    const query = { playerAddress: address.toLowerCase() };
    if (gameType) query.gameType = gameType;
    
    const history = await GameHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await GameHistory.countDocuments(query);
    
    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save game result
exports.saveGameResult = async (req, res) => {
  try {
    const { gameType, gameId, playerAddress, betAmount, winAmount, result, txHash, blockNumber, metadata } = req.body;
    
    const gameHistory = new GameHistory({
      gameType,
      gameId,
      playerAddress: playerAddress.toLowerCase(),
      betAmount,
      winAmount,
      result,
      txHash,
      blockNumber,
      metadata
    });
    
    await gameHistory.save();
    
    // Update leaderboard
    await updateLeaderboard(playerAddress, betAmount, winAmount, result);
    
    res.json({ success: true, data: gameHistory });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate txHash
      return res.status(400).json({ success: false, error: 'Transaction already recorded' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get game statistics
exports.getGameStats = async (req, res) => {
  try {
    const { gameType } = req.params;
    
    const totalGames = await GameHistory.countDocuments({ gameType });
    const totalWins = await GameHistory.countDocuments({ gameType, result: 'win' });
    const totalLosses = await GameHistory.countDocuments({ gameType, result: 'lose' });
    
    const wageredResult = await GameHistory.aggregate([
      { $match: { gameType } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$betAmount' } } } }
    ]);
    
    const wonResult = await GameHistory.aggregate([
      { $match: { gameType, result: 'win' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$winAmount' } } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalGames,
        totalWins,
        totalLosses,
        winRate: totalGames > 0 ? (totalWins / totalGames * 100).toFixed(2) : 0,
        totalWagered: wageredResult[0]?.total || 0,
        totalWon: wonResult[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to update leaderboard
async function updateLeaderboard(playerAddress, betAmount, winAmount, result) {
  const address = playerAddress.toLowerCase();
  
  let player = await Leaderboard.findOne({ playerAddress: address });
  
  if (!player) {
    player = new Leaderboard({ playerAddress: address });
  }
  
  player.totalGames += 1;
  if (result === 'win') player.totalWins += 1;
  if (result === 'lose') player.totalLosses += 1;
  
  const currentWagered = parseFloat(player.totalWagered || 0);
  const currentWon = parseFloat(player.totalWon || 0);
  
  player.totalWagered = (currentWagered + parseFloat(betAmount)).toString();
  player.totalWon = (currentWon + parseFloat(winAmount || 0)).toString();
  player.winRate = player.totalGames > 0 ? (player.totalWins / player.totalGames * 100) : 0;
  player.lastPlayed = new Date();
  
  await player.save();
  
  // Update ranks
  const allPlayers = await Leaderboard.find().sort({ totalWon: -1 });
  for (let i = 0; i < allPlayers.length; i++) {
    allPlayers[i].rank = i + 1;
    await allPlayers[i].save();
  }
}
