/**
 * Script tạo Hedera Fungible Token cho Bomdog Coin
 * Chạy: node scripts/create-hedera-token.js
 */

const {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar
} = require("@hashgraph/sdk");

async function createBomdogToken() {
  console.log("🚀 Đang tạo Bomdog Token trên Hedera Testnet...\n");

  // ⚠️ THAY ĐỔI CÁC GIÁ TRỊ NÀY
  const MY_ACCOUNT_ID = "0.0.7775085"; // Thay bằng Account ID của bạn
  const MY_PRIVATE_KEY = "0xd4e97b14ef9df9d7f77c02daf63dfba0b341e33f490954e125a31072e1d57566"; // Thay bằng Private Key của bạn

  // Validate
  if (MY_ACCOUNT_ID === "0.0.7775085" || MY_PRIVATE_KEY === "0xd4e97b14ef9df9d7f77c02daf63dfba0b341e33f490954e125a31072e1d57566") {
    console.error("❌ VUI LÒNG THAY ĐỔI MY_ACCOUNT_ID và MY_PRIVATE_KEY trong file này!");
    process.exit(1);
  }

  try {
    // Kết nối Hedera Testnet
    const client = Client.forTestnet();
    client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

    // Parse private key
    const treasuryKey = PrivateKey.fromString(MY_PRIVATE_KEY);

    // Tạo token
    const transaction = await new TokenCreateTransaction()
      .setTokenName("Bomdog Coin")
      .setTokenSymbol("BOMDOG")
      .setDecimals(2) // 2 decimals (1 BOMDOG = 100 units)
      .setInitialSupply(1000000000) // 10,000,000.00 BOMDOG
      .setTreasuryAccountId(MY_ACCOUNT_ID)
      .setSupplyType(TokenSupplyType.Infinite) // Có thể mint thêm
      .setSupplyKey(treasuryKey) // Key để mint thêm token
      .setAdminKey(treasuryKey) // Key để quản lý token
      .setMaxTransactionFee(new Hbar(20)) // Max fee
      .freezeWith(client);

    // Sign và submit
    const signTx = await transaction.sign(treasuryKey);
    const txResponse = await signTx.execute(client);

    // Đợi receipt
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log("✅ Token đã được tạo thành công!");
    console.log("\n📋 THÔNG TIN TOKEN:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Token Name:    Bomdog Coin");
    console.log("Token Symbol:  BOMDOG");
    console.log("Token ID:      " + tokenId);
    console.log("Decimals:      2");
    console.log("Initial Supply: 10,000,000.00 BOMDOG");
    console.log("Treasury:      " + MY_ACCOUNT_ID);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 Copy Token ID này và paste vào file .env:");
    console.log(`BOMDOG_HEDERA_TOKEN_ID=${tokenId}\n`);

    console.log("🔗 Xem token trên explorer:");
    console.log(`https://hashscan.io/testnet/token/${tokenId}\n`);

  } catch (error) {
    console.error("❌ Lỗi khi tạo token:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

createBomdogToken();
