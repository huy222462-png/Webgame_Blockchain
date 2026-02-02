const hre = require("hardhat");

async function main() {
  console.log("💰 Funding Bomdog Contract for Withdrawals\n");

  const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS || "0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d";
  
  const [owner] = await hre.ethers.getSigners();
  console.log("Owner address:", owner.address);
  
  // Get contract instance
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const token = BomdogToken.attach(contractAddress);
  
  // Check owner balance
  const ownerBalance = await token.balanceOf(owner.address);
  console.log("Owner balance:", hre.ethers.formatUnits(ownerBalance, 18), "BOMDOG");
  
  // Check contract balance before
  const contractBalanceBefore = await token.balanceOf(contractAddress);
  console.log("Contract balance (before):", hre.ethers.formatUnits(contractBalanceBefore, 18), "BOMDOG");
  
  // Fund contract với 5M tokens (giữ lại 5M cho owner)
  const fundAmount = hre.ethers.parseUnits("5000000", 18); // 5 million tokens
  
  console.log("\n🔄 Transferring", hre.ethers.formatUnits(fundAmount, 18), "BOMDOG to contract...");
  const tx = await token.transfer(contractAddress, fundAmount);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");
  
  // Check balances after
  const ownerBalanceAfter = await token.balanceOf(owner.address);
  const contractBalanceAfter = await token.balanceOf(contractAddress);
  
  console.log("\n📊 Final Balances:");
  console.log("Owner balance:", hre.ethers.formatUnits(ownerBalanceAfter, 18), "BOMDOG");
  console.log("Contract balance:", hre.ethers.formatUnits(contractBalanceAfter, 18), "BOMDOG");
  
  console.log("\n✅ Contract funded successfully!");
  console.log("   Contract can now process", hre.ethers.formatUnits(contractBalanceAfter, 18), "BOMDOG in withdrawals");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
