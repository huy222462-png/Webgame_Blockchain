// Deploy all contracts to the same network
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of all contracts...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("=" .repeat(60) + "\n");

  const deploymentResults = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  // 1. Deploy TaiXiuGame
  console.log("1️⃣  Deploying TaiXiuGame...");
  const TaiXiuGame = await hre.ethers.getContractFactory("TaiXiuGame");
  const taixiu = await TaiXiuGame.deploy();
  await taixiu.waitForDeployment();
  const taixiuAddress = await taixiu.getAddress();
  console.log("✅ TaiXiuGame deployed to:", taixiuAddress);
  deploymentResults.contracts.TaiXiuGame = taixiuAddress;
  console.log("");

  // 2. Deploy FishingGame
  console.log("2️⃣  Deploying FishingGame...");
  const FishingGame = await hre.ethers.getContractFactory("FishingGame");
  const fishing = await FishingGame.deploy();
  await fishing.waitForDeployment();
  const fishingAddress = await fishing.getAddress();
  console.log("✅ FishingGame deployed to:", fishingAddress);
  deploymentResults.contracts.FishingGame = fishingAddress;
  console.log("");


  // 3. Fund FishingGame contract
  console.log("3️⃣  Funding FishingGame contract...");

  // 3. Deploy BomdogGame
  console.log("3️⃣  Deploying BomdogGame...");
  const BomdogGame = await hre.ethers.getContractFactory("BomdogGame");
  const bomdog = await BomdogGame.deploy();
  await bomdog.waitForDeployment();
  const bomdogAddress = await bomdog.getAddress();
  console.log("✅ BomdogGame deployed to:", bomdogAddress);
  deploymentResults.contracts.BomdogGame = bomdogAddress;
  console.log("");

  // 4. Fund FishingGame contract
  console.log("4️⃣  Funding FishingGame contract...");

  const fundAmount = hre.ethers.parseEther("0.1");
  const fundTx = await fishing.fundContract({ value: fundAmount });
  await fundTx.wait();
  console.log("✅ FishingGame funded with 0.1 ETH");
  console.log("");

  // Save deployment info
  console.log("=" .repeat(60));
  console.log("💾 Saving deployment information...\n");
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${network.chainId}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentResults, null, 2));
  console.log("✅ Deployment info saved to:", filename);

  // Save latest deployment
  const latestPath = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestPath, JSON.stringify(deploymentResults, null, 2));
  console.log("✅ Latest deployment updated\n");

  // Generate .env content for frontend
  console.log("=" .repeat(60));
  console.log("📋 Frontend Environment Variables:\n");
  console.log("Copy these to frontend/.env:\n");
  console.log(`VITE_TAIXIU_CONTRACT=${taixiuAddress}`);
  console.log(`VITE_FISHING_CONTRACT=${fishingAddress}`);


  console.log(`VITE_BOMDOG_CONTRACT=${bomdogAddress}`);

  console.log(`VITE_CHAIN_ID=${network.chainId}`);
  console.log(`VITE_NETWORK_NAME=${network.name}`);
  console.log("");

  // Save .env.example for frontend
  const envContent = `# Generated on ${new Date().toISOString()}
# Network: ${network.name} (Chain ID: ${network.chainId})

# Gaming Contracts
VITE_TAIXIU_CONTRACT=${taixiuAddress}
VITE_FISHING_CONTRACT=${fishingAddress}


VITE_BOMDOG_CONTRACT=${bomdogAddress}


# Network Configuration
VITE_CHAIN_ID=${network.chainId}
VITE_NETWORK_NAME=${network.name}

# Backend API
VITE_API_URL=http://localhost:5000

# Tutorial Contracts (if deployed separately)
# VITE_COUNTER_CONTRACT=
# VITE_MYTOKEN_CONTRACT=0x73C6C18b1EDEB8319cA52f02f948c35FA8177401
`;

  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env.deployment");
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("✅ Frontend .env.deployment file created");
  console.log("");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 Deployment Complete!\n");
  console.log("📊 Summary:");
  console.log("  - TaiXiuGame: ", taixiuAddress);
  console.log("  - FishingGame:", fishingAddress);


  console.log("  - BomdogGame: ", bomdogAddress);

  console.log("  - Network:    ", network.name, `(${network.chainId})`);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("  1. Copy frontend/.env.deployment to frontend/.env");
  console.log("  2. Update backend with contract addresses if needed");
  console.log("  3. Start backend: npm run dev");
  console.log("  4. Start frontend: cd frontend && npm run dev");
  console.log("  5. Connect MetaMask to the correct network");
  console.log("");
  console.log("🔍 Verify contracts (optional):");
  console.log(`  npx hardhat verify --network ${network.name} ${taixiuAddress}`);
  console.log(`  npx hardhat verify --network ${network.name} ${fishingAddress}`);
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
