const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  playerAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  playerName: {
    type: String,
    default: ''
  },
  totalGames: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  totalWagered: {
    type: String,
    default: '0'
  },
  totalWon: {
    type: String,
    default: '0'
  },
  winRate: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

LeaderboardSchema.index({ totalWon: -1 });
LeaderboardSchema.index({ winRate: -1 });
LeaderboardSchema.index({ rank: 1 });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
