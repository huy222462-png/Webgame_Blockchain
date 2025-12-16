const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying TaiXiuGame contract...");
  
  const TaiXiuGame = await hre.ethers.getContractFactory("TaiXiuGame");
  const taixiu = await TaiXiuGame.deploy();
  
  await taixiu.waitForDeployment();
  const taixiuAddress = await taixiu.getAddress();
  
  console.log("✅ TaiXiuGame deployed to:", taixiuAddress);
  
  console.log("\n🚀 Deploying FishingGame contract...");
  
  const FishingGame = await hre.ethers.getContractFactory("FishingGame");
  const fishing = await FishingGame.deploy();
  
  await fishing.waitForDeployment();
  const fishingAddress = await fishing.getAddress();
  
  console.log("✅ FishingGame deployed to:", fishingAddress);
  
  // Fund FishingGame contract with some ETH for rewards
  console.log("\n💰 Funding FishingGame contract...");
  const fundTx = await fishing.fundContract({ value: hre.ethers.parseEther("0.1") });
  await fundTx.wait();
  console.log("✅ FishingGame funded with 0.1 ETH");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    TaiXiuGame: taixiuAddress,
    FishingGame: fishingAddress,
    timestamp: new Date().toISOString()
  };
  
  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📝 Deployment info saved to deployments/" + hre.network.name + ".json");
  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("   TaiXiuGame:", taixiuAddress);
  console.log("   FishingGame:", fishingAddress);
  
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await taixiu.deploymentTransaction().wait(5);
    await fishing.deploymentTransaction().wait(5);
    
    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: taixiuAddress,
        constructorArguments: [],
      });
      console.log("✅ TaiXiuGame verified");
    } catch (error) {
      console.log("❌ TaiXiuGame verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: fishingAddress,
        constructorArguments: [],
      });
      console.log("✅ FishingGame verified");
    } catch (error) {
      console.log("❌ FishingGame verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
