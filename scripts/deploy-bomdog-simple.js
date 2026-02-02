const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BOMDOG Token...\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const initialSupply = hre.ethers.parseUnits("10000000", 18); // 10M tokens with 18 decimals
  const decimals = 18; // Standard ERC20 decimals
  
  console.log("Deploying contract...");
  const token = await BomdogToken.deploy(initialSupply, decimals);
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log("\n✅ BOMDOG Token deployed!");
  console.log("📍 Address:", address);
  console.log("\n📋 Cập nhật vào backend/.env:");
  console.log(`BOMDOG_CONTRACT_ADDRESS=${address}`);
  console.log(`BOMDOG_WITHDRAWER_KEY=61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
