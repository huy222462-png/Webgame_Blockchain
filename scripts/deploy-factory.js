const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ContractFactory...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy Factory
  const ContractFactory = await hre.ethers.getContractFactory("ContractFactory");
  const factory = await ContractFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  
  console.log("\n✅ ContractFactory deployed!");
  console.log("📍 Address:", factoryAddress);
  
  console.log("\n📋 Sử dụng Factory:");
  console.log("1. Từ frontend hoặc script:");
  console.log(`   const factory = await ethers.getContractAt("ContractFactory", "${factoryAddress}");`);
  console.log("   const tx = await factory.deploySimpleGame();");
  console.log("   const receipt = await tx.wait();");
  console.log("\n2. Lấy contract vừa tạo:");
  console.log("   const newGameAddress = receipt.events[0].args.contractAddress;");
  
  console.log("\n3. Tương tác với game mới:");
  console.log("   const game = await ethers.getContractAt('SimpleGame', newGameAddress);");
  console.log("   await game.incrementScore(100);");
  
  console.log("\n🔗 Verify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
