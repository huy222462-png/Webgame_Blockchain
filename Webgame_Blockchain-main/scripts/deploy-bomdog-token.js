/**
 * Deploy Bomdog Token (ERC20) lên Ethereum/Sepolia
 * 
 * Cách chạy:
 * npx hardhat run scripts/deploy-bomdog-token.js --network sepolia
 * npx hardhat run scripts/deploy-bomdog-token.js --network localhost
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Bomdog Token (ERC20)...\n");

  // Lấy deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("═".repeat(60) + "\n");

  // Token configuration
  const TOKEN_DECIMALS = 2; // 2 decimals như Hedera (1 BOMDOG = 100 units)
  const INITIAL_SUPPLY = 10_000_000; // 10 triệu BOMDOG
  const INITIAL_SUPPLY_WITH_DECIMALS = BigInt(INITIAL_SUPPLY) * BigInt(10 ** TOKEN_DECIMALS);

  console.log("⚙️  Token Configuration:");
  console.log("   Name: Bomdog Coin");
  console.log("   Symbol: BOMDOG");
  console.log("   Decimals:", TOKEN_DECIMALS);
  console.log("   Initial Supply:", INITIAL_SUPPLY.toLocaleString(), "BOMDOG");
  console.log("   Initial Supply (with decimals):", INITIAL_SUPPLY_WITH_DECIMALS.toString(), "units");
  console.log("");

  // Deploy contract
  console.log("🔨 Deploying contract...");
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const token = await BomdogToken.deploy(INITIAL_SUPPLY_WITH_DECIMALS, TOKEN_DECIMALS);
  
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ BomdogToken deployed to:", tokenAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  const ownerBalance = await token.balanceOf(deployer.address);

  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals);
  console.log("   Total Supply:", hre.ethers.formatUnits(totalSupply, decimals), symbol);
  console.log("   Owner Balance:", hre.ethers.formatUnits(ownerBalance, decimals), symbol);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contract: {
      name: "BomdogToken",
      address: tokenAddress,
      tokenName: name,
      symbol: symbol,
      decimals: Number(decimals),
      initialSupply: INITIAL_SUPPLY,
      totalSupply: totalSupply.toString()
    }
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `bomdog-token-${network.chainId}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("═".repeat(60));
  console.log("💾 Deployment info saved to:", filename);
  console.log("═".repeat(60) + "\n");

  // Environment variables
  console.log("📋 QUAN TRỌNG - Cập nhật file backend/.env:\n");
  console.log("BOMDOG_CONTRACT_ADDRESS=" + tokenAddress);
  console.log("BOMDOG_WITHDRAWER_KEY=<your-private-key-here>");
  console.log("BOMDOG_RPC_URL=" + (network.name === "sepolia" ? "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY" : "http://localhost:8545"));
  console.log("BOMDOG_COIN_DECIMALS=" + TOKEN_DECIMALS);
  console.log("");

  // Contract verification
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("═".repeat(60));
    console.log("🔐 Verify contract trên Etherscan:");
    console.log("");
    console.log("npx hardhat verify --network", network.name, tokenAddress, INITIAL_SUPPLY_WITH_DECIMALS.toString(), TOKEN_DECIMALS);
    console.log("");
    console.log("Sau khi verify, xem contract tại:");
    console.log("https://" + (network.name === "mainnet" ? "" : network.name + ".") + "etherscan.io/address/" + tokenAddress);
    console.log("═".repeat(60) + "\n");
  }

  // Important notes
  console.log("⚠️  LƯU Ý QUAN TRỌNG:");
  console.log("");
  console.log("1. Account deployer (" + deployer.address + ") hiện có toàn bộ " + INITIAL_SUPPLY.toLocaleString() + " BOMDOG");
  console.log("");
  console.log("2. Để withdraw cho users, bạn cần:");
  console.log("   - Chuyển BOMDOG tokens vào withdrawer wallet");
  console.log("   - Đảm bảo withdrawer wallet có đủ ETH để trả gas fees");
  console.log("   - Cập nhật BOMDOG_WITHDRAWER_KEY trong .env");
  console.log("");
  console.log("3. Lệnh transfer tokens (chạy trên console hoặc script):");
  console.log("   await token.transfer('WITHDRAWER_ADDRESS', ethers.parseUnits('1000000', " + TOKEN_DECIMALS + "));");
  console.log("");
  console.log("4. Get testnet ETH:");
  console.log("   Sepolia: https://sepoliafaucet.com/");
  console.log("   Sepolia: https://www.alchemy.com/faucets/ethereum-sepolia");
  console.log("");

  console.log("✅ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
