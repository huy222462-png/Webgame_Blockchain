#!/usr/bin/env node
const hre = require("hardhat");

// Lấy tham số từ command line
const recipientAddress = process.argv[2];
const amount = process.argv[3];

async function main() {
  if (!recipientAddress || !amount) {
    console.error("\n❌ Thiếu tham số!");
    console.log("\nCách dùng:");
    console.log("  npx hardhat run scripts/bomdog-transfer.js --network sepolia <địa_chỉ_nhận> <số_lượng>");
    console.log("\nVí dụ:");
    console.log("  npx hardhat run scripts/bomdog-transfer.js --network sepolia 0xabc...123 1000");
    process.exit(1);
  }

  const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS || "0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d";
  
  console.log("\n💸 CHUYỂN BOMDOG TOKEN\n");
  console.log("=".repeat(60));
  
  const [sender] = await hre.ethers.getSigners();
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const token = BomdogToken.attach(contractAddress);
  
  const transferAmount = hre.ethers.parseUnits(amount.toString(), 18);
  
  console.log(`From:   ${sender.address}`);
  console.log(`To:     ${recipientAddress}`);
  console.log(`Amount: ${amount} BOMDOG`);
  
  // Check balance
  const senderBalance = await token.balanceOf(sender.address);
  console.log(`\nYour balance: ${hre.ethers.formatUnits(senderBalance, 18)} BOMDOG`);
  
  if (senderBalance < transferAmount) {
    console.error("\n❌ Số dư không đủ!");
    process.exit(1);
  }
  
  console.log("\n🔄 Đang chuyển...");
  const tx = await token.transfer(recipientAddress, transferAmount);
  console.log(`Transaction: ${tx.hash}`);
  
  await tx.wait();
  console.log("✅ Chuyển thành công!");
  
  const newBalance = await token.balanceOf(sender.address);
  const recipientBalance = await token.balanceOf(recipientAddress);
  
  console.log("\n📊 Số dư mới:");
  console.log(`Your balance:      ${hre.ethers.formatUnits(newBalance, 18)} BOMDOG`);
  console.log(`Recipient balance: ${hre.ethers.formatUnits(recipientBalance, 18)} BOMDOG`);
  
  console.log(`\n🔗 View: https://sepolia.etherscan.io/tx/${tx.hash}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
