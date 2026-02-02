/**
 * Hedera Withdraw Service
 * Xử lý withdraw token trên Hedera Network
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TransferTransaction,
  Hbar
} = require("@hashgraph/sdk");

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let cachedClient = null;
let cachedConfig = null;

/**
 * Lấy Hedera client (singleton)
 */
function getHederaClient() {
  const accountId = process.env.BOMDOG_HEDERA_ACCOUNT_ID;
  const privateKey = process.env.BOMDOG_HEDERA_PRIVATE_KEY;
  const network = process.env.BOMDOG_HEDERA_NETWORK || 'testnet';

  if (!accountId || !privateKey) {
    const error = new Error('Hedera credentials not configured. Set BOMDOG_HEDERA_ACCOUNT_ID and BOMDOG_HEDERA_PRIVATE_KEY');
    error.statusCode = 500;
    throw error;
  }

  const configKey = `${network}|${accountId}`;
  
  if (!cachedClient || cachedConfig !== configKey) {
    try {
      const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      client.setOperator(accountId, privateKey);
      
      cachedClient = client;
      cachedConfig = configKey;
      
      console.log(`✅ Hedera client initialized for ${network}`);
    } catch (error) {
      throw new Error(`Failed to initialize Hedera client: ${error.message}`);
    }
  }

  return cachedClient;
}

/**
 * Chuyển token Hedera cho user
 * @param {string} recipientAddress - Hedera Account ID của người nhận (0.0.xxxxx)
 * @param {number} amount - Số lượng token (đã tính decimals)
 * @returns {Promise<{txHash: string, txId: string}>}
 */
async function performHederaWithdraw(recipientAddress, amount) {
  const client = getHederaClient();
  
  const tokenId = process.env.BOMDOG_HEDERA_TOKEN_ID;
  const treasuryId = process.env.BOMDOG_HEDERA_ACCOUNT_ID;
  const decimals = parseInt(process.env.BOMDOG_COIN_DECIMALS || '2', 10);
  
  if (!tokenId) {
    throw new Error('BOMDOG_HEDERA_TOKEN_ID not configured');
  }

  try {
    // Validate recipient address format (Hedera Account ID: 0.0.xxxxx)
    if (!/^0\.0\.\d+$/.test(recipientAddress)) {
      throw new Error(`Invalid Hedera Account ID format: ${recipientAddress}. Expected format: 0.0.xxxxx`);
    }

    // Convert amount to token units (với decimals)
    const tokenAmount = Math.floor(amount * Math.pow(10, decimals));

    console.log(`🔄 Transferring ${amount} BOMDOG (${tokenAmount} units) to ${recipientAddress}...`);

    // Tạo transfer transaction
    const transaction = new TransferTransaction()
      .addTokenTransfer(tokenId, treasuryId, -tokenAmount) // Trừ từ treasury
      .addTokenTransfer(tokenId, recipientAddress, tokenAmount) // Cộng cho user
      .setMaxTransactionFee(new Hbar(1)); // Max 1 HBAR fee

    // Execute transaction
    const txResponse = await transaction.execute(client);

    // Đợi receipt
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
    }

    const txId = txResponse.transactionId.toString();
    const txHash = txResponse.transactionHash ? Buffer.from(txResponse.transactionHash).toString('hex') : txId;

    console.log(`✅ Withdraw successful! TX ID: ${txId}`);
    console.log(`🔗 View on HashScan: https://hashscan.io/${process.env.BOMDOG_HEDERA_NETWORK || 'testnet'}/transaction/${txId}`);

    return {
      txHash,
      txId,
      receipt
    };

  } catch (error) {
    console.error('❌ Hedera withdraw failed:', error.message);
    throw new Error(`Hedera withdraw failed: ${error.message}`);
  }
}

/**
 * Kiểm tra token balance của treasury account
 */
async function checkTreasuryBalance() {
  const client = getHederaClient();
  const accountId = process.env.BOMDOG_HEDERA_ACCOUNT_ID;
  const tokenId = process.env.BOMDOG_HEDERA_TOKEN_ID;

  try {
    const query = new AccountBalanceQuery()
      .setAccountId(accountId);

    const balance = await query.execute(client);
    const tokenBalance = balance.tokens.get(TokenId.fromString(tokenId));

    return {
      hbar: balance.hbars.toString(),
      bomdog: tokenBalance ? tokenBalance.toString() : '0'
    };
  } catch (error) {
    console.error('Failed to check treasury balance:', error.message);
    return null;
  }
}

module.exports = {
  performHederaWithdraw,
  checkTreasuryBalance,
  getHederaClient
};
