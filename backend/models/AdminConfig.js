const mongoose = require('mongoose');

const AdminConfigSchema = new mongoose.Schema(
  {
    conversionRate: {
      points: { type: Number, default: 1000, min: 1 },
      currency: { type: Number, default: 10, min: 0 }
    },
    baseUpgradeCost: { type: Number, default: 30, min: 0 },
    upgradeMultiplier: { type: Number, default: 1.2, min: 1 },
    singletonKey: {
      type: String,
      default: 'game-economy-config',
      unique: true
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminConfig', AdminConfigSchema);
