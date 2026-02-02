#!/usr/bin/env node
const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.BOMDOG_CONTRACT_ADDRESS || "0xcAb7EDB405E1A3072CdcE909AC75819B935EB85d";
  const yourAddress = "0x91439D81f62146F54E9310a27459994f0aA602D6";
  
  console.log("\n💰 QUẢN LÝ BOMDOG TOKEN\n");
  console.log("=".repeat(70));
  
  const BomdogToken = await hre.ethers.getContractFactory("BomdogToken");
  const token = BomdogToken.attach(contractAddress);
  
  // Lấy thông tin token
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply()
  ]);
  
  console.log("📋 Thông tin Token:");
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Network: Sepolia Testnet`);
  
  console.log("\n" + "=".repeat(70));
  
  // Lấy số dư của các địa chỉ
  const [ownerBalance, contractBalance] = await Promise.all([
    token.balanceOf(yourAddress),
    token.balanceOf(contractAddress)
  ]);
  
  console.log("\n💼 Số dư các địa chỉ:");
  console.log(`   Your wallet: ${hre.ethers.formatUnits(ownerBalance, decimals)} ${symbol}`);
  console.log(`   Contract:    ${hre.ethers.formatUnits(contractBalance, decimals)} ${symbol}`);
  
  console.log("\n" + "=".repeat(70));
  console.log("\n✨ BẠN CÓ THỂ LÀM GÌ VỚI BOMDOG:\n");
  
  console.log("1️⃣  XEM TOKEN TRONG METAMASK:");
  console.log("   - Mở MetaMask");
  console.log("   - Chọn network: Sepolia Test Network");
  console.log("   - Click 'Import tokens'");
  console.log(`   - Token Address: ${contractAddress}`);
  console.log(`   - Symbol: ${symbol}`);
  console.log(`   - Decimals: ${decimals}`);
  
  console.log("\n2️⃣  CHUYỂN TOKEN CHO NGƯỜI KHÁC:");
  console.log("   npm run bomdog:transfer -- <địa_chỉ_nhận> <số_lượng>");
  console.log("   Ví dụ: npm run bomdog:transfer -- 0xabc...123 1000");
  
  console.log("\n3️⃣  NẠP TOKEN VÀO CONTRACT (cho withdraw):");
  console.log("   npm run bomdog:fund -- <số_lượng>");
  console.log("   Ví dụ: npm run bomdog:fund -- 1000000");
  
  console.log("\n4️⃣  MINT THÊM TOKEN (owner only):");
  console.log("   npm run bomdog:mint -- <địa_chỉ_nhận> <số_lượng>");
  console.log("   Ví dụ: npm run bomdog:mint -- 0xabc...123 500000");
  
  console.log("\n5️⃣  SỬ DỤNG TRONG GAME:");
  console.log("   - User chơi game kiếm điểm");
  console.log("   - Đổi điểm → Bomdog Coin (in-game)");
  console.log("   - Yêu cầu rút tiền");
  console.log("   - Admin duyệt → Nhận BOMDOG thật vào ví");
  
  console.log("\n6️⃣  XEM LỊCH SỬ GIAO DỊCH:");
  console.log(`   https://sepolia.etherscan.io/token/${contractAddress}`);
  
  console.log("\n" + "=".repeat(70));
  console.log("\n📱 IMPORT VÍ VÀO METAMASK:\n");
  console.log("   1. Mở MetaMask → Click menu (3 chấm)");
  console.log("   2. Account details → Export Private Key");
  console.log("   3. Hoặc dùng private key từ .env:");
  console.log("      61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465");
  console.log("   ⚠️  KHÔNG CHIA SẺ PRIVATE KEY!");
  
  console.log("\n" + "=".repeat(70));
  console.log("\n🔗 LINKS HỮU ÍCH:\n");
  console.log(`   Contract: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`   Your wallet: https://sepolia.etherscan.io/address/${yourAddress}`);
  console.log("   Faucet ETH: https://sepoliafaucet.com/");
  console.log("   Sepolia Explorer: https://sepolia.etherscan.io/");
  
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
