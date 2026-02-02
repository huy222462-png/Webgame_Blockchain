const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Withdraw Function\n");

  const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS || "0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d";
  const testUserAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1".toLowerCase(); // Địa chỉ test
  const withdrawAmount = hre.ethers.parseUnits("100", 18); // Test với 100 BOMDOG
  
  const [owner] = await hre.ethers.getSigners();
  console.log("Owner/Withdrawer:", owner.address);
  console.log("Contract:", contractAddress);
  console.log("Test user:", testUserAddress);
  console.log("Withdraw amount:", hre.ethers.formatUnits(withdrawAmount, 18), "BOMDOG\n");
  
  // Get contract instance
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const token = BomdogToken.attach(contractAddress);
  
  // Check balances before
  const contractBalanceBefore = await token.balanceOf(contractAddress);
  const userBalanceBefore = await token.balanceOf(testUserAddress);
  
  console.log("📊 Balances BEFORE:");
  console.log("Contract:", hre.ethers.formatUnits(contractBalanceBefore, 18), "BOMDOG");
  console.log("User:", hre.ethers.formatUnits(userBalanceBefore, 18), "BOMDOG");
  
  // Test withdraw
  console.log("\n🔄 Calling withdraw function...");
  try {
    // Gọi withdraw với 2 tham số: address và amount
    const tx = await token["withdraw(address,uint256)"](testUserAddress, withdrawAmount);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed! Block:", receipt.blockNumber);
    
    // Check balances after
    const contractBalanceAfter = await token.balanceOf(contractAddress);
    const userBalanceAfter = await token.balanceOf(testUserAddress);
    
    console.log("\n📊 Balances AFTER:");
    console.log("Contract:", hre.ethers.formatUnits(contractBalanceAfter, 18), "BOMDOG");
    console.log("User:", hre.ethers.formatUnits(userBalanceAfter, 18), "BOMDOG");
    
    console.log("\n✅ Withdraw test SUCCESSFUL!");
    console.log("   User received:", hre.ethers.formatUnits(userBalanceAfter - userBalanceBefore, 18), "BOMDOG");
    console.log("\n🎉 Backend withdraw sẽ hoạt động tốt!");
    
  } catch (error) {
    console.error("\n❌ Withdraw test FAILED!");
    console.error("Error:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
