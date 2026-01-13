// Verify all deployed contracts are working
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Verifying deployment...\n");

  // Load latest deployment
  const latestPath = path.join(__dirname, "..", "deployments", "latest.json");
  
  if (!fs.existsSync(latestPath)) {
    console.error("❌ No deployment found. Run deploy-all.js first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(latestPath, "utf8"));
  
  console.log("📋 Deployment Info:");
  console.log("  Network:", deployment.network);
  console.log("  Chain ID:", deployment.chainId);
  console.log("  Deployed:", new Date(deployment.timestamp).toLocaleString());
  console.log("");

  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Using account:", signer.address);
  console.log("");

  // Test TaiXiuGame
  console.log("1️⃣  Testing TaiXiuGame...");
  try {
    const taixiuAddress = deployment.contracts.TaiXiuGame;
    const taixiu = await hre.ethers.getContractAt("TaiXiuGame", taixiuAddress);
    
    const owner = await taixiu.owner();
    console.log("   Owner:", owner);
    
    const gameCounter = await taixiu.gameCounter();
    console.log("   Game Counter:", gameCounter.toString());
    
    const currentGame = await taixiu.games(gameCounter);
    console.log("   Current Game ID:", currentGame.gameId.toString());
    console.log("   ✅ TaiXiuGame is working!");
  } catch (error) {
    console.error("   ❌ TaiXiuGame verification failed:", error.message);
  }
  console.log("");

  // Test FishingGame
  console.log("2️⃣  Testing FishingGame...");
  try {
    const fishingAddress = deployment.contracts.FishingGame;
    const fishing = await hre.ethers.getContractAt("FishingGame", fishingAddress);
    
    const owner = await fishing.owner();
    console.log("   Owner:", owner);
    
    const jackpot = await fishing.jackpotPool();
    console.log("   Jackpot Pool:", hre.ethers.formatEther(jackpot), "ETH");
    
    const balance = await hre.ethers.provider.getBalance(fishingAddress);
    console.log("   Contract Balance:", hre.ethers.formatEther(balance), "ETH");
    
    console.log("   ✅ FishingGame is working!");
  } catch (error) {
    console.error("   ❌ FishingGame verification failed:", error.message);
  }
  console.log("");

  // Check network
  console.log("3️⃣  Checking network connection...");
  try {
    const network = await hre.ethers.provider.getNetwork();
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("   Connected to:", network.name);
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Latest block:", blockNumber);
    console.log("   ✅ Network connection OK!");
  } catch (error) {
    console.error("   ❌ Network check failed:", error.message);
  }
  console.log("");

  console.log("=" .repeat(60));
  console.log("✅ Verification complete!");
  console.log("");
  console.log("📝 Contract Addresses:");
  console.log("  TaiXiuGame: ", deployment.contracts.TaiXiuGame);
  console.log("  FishingGame:", deployment.contracts.FishingGame);
  console.log("");
  console.log("🌐 Add to MetaMask:");
  console.log(`  Network: ${deployment.network}`);
  console.log(`  Chain ID: ${deployment.chainId}`);
  console.log("");
  console.log("🎮 Ready to play!");
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
