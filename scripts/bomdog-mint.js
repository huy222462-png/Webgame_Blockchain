#!/usr/bin/env node
const hre = require("hardhat");

const amount = process.argv[2];

async function main() {
  if (!amount) {
    console.error("\n❌ Thiếu số lượng!");
    console.log("\nCách dùng:");
    console.log("  npx hardhat run scripts/bomdog-mint.js --network sepolia <địa_chỉ_nhận> <số_lượng>");
    console.log("\nVí dụ:");
    console.log("  npx hardhat run scripts/bomdog-mint.js --network sepolia 0xabc...123 500000");
    process.exit(1);
  }

  const recipientAddress = process.argv[2];
  const mintAmount = process.argv[3] || amount;
  const to = process.argv[3] ? recipientAddress : (await hre.ethers.getSigners())[0].address;
  
  const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS || "0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d";
  
  console.log("\n🪙 MINT BOMDOG TOKEN\n");
  console.log("=".repeat(60));
  
  const [owner] = await hre.ethers.getSigners();
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const token = BomdogToken.attach(contractAddress);
  
  const amount_wei = hre.ethers.parseUnits(mintAmount.toString(), 18);
  
  console.log(`Owner:  ${owner.address}`);
  console.log(`To:     ${to}`);
  console.log(`Amount: ${mintAmount} BOMDOG`);
  
  // Check total supply before
  const supplyBefore = await token.totalSupply();
  console.log(`\nTotal Supply (before): ${hre.ethers.formatUnits(supplyBefore, 18)} BOMDOG`);
  
  console.log("\n🔄 Đang mint...");
  const tx = await token.mint(to, amount_wei);
  console.log(`Transaction: ${tx.hash}`);
  
  await tx.wait();
  console.log("✅ Mint thành công!");
  
  const supplyAfter = await token.totalSupply();
  const recipientBalance = await token.balanceOf(to);
  
  console.log("\n📊 Kết quả:");
  console.log(`Total Supply (after):  ${hre.ethers.formatUnits(supplyAfter, 18)} BOMDOG`);
  console.log(`Recipient balance:     ${hre.ethers.formatUnits(recipientBalance, 18)} BOMDOG`);
  
  console.log(`\n🔗 View: https://sepolia.etherscan.io/tx/${tx.hash}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
