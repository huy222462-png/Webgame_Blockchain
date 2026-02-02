# 🚀 HƯỚNG DẪN TOÀN DIỆN - PHẦN 2/3

*Tiếp theo từ [06-HUONG-DAN-TOAN-DIEN-A-Z.md](06-HUONG-DAN-TOAN-DIEN-A-Z.md)*

---

## 7. TÍCH HỢP BLOCKCHAIN VÀO FRONTEND

### 7.1. Blockchain Utilities

**File: `frontend/src/utils/blockchain.js`**
```javascript
import { ethers } from 'ethers';

// Contract ABIs (simplified - thêm đầy đủ sau khi compile)
export const TaiXiuABI = [
  "function placeBet(uint8 _betType) external payable",
  "function withdrawWinnings() external",
  "function getPlayerStats(address _player) external view returns (uint256, uint256)",
  "function MIN_BET() external view returns (uint256)",
  "function MAX_BET() external view returns (uint256)",
  "event BetPlaced(address indexed player, uint256 amount, uint8 betType, uint256 timestamp)",
  "event GameResult(address indexed player, uint256 diceResult, bool won, uint256 payout, uint256 timestamp)"
];

export const FishingABI = [
  "function startSession() external payable",
  "function castLine() external",
  "function endSession() external",
  "function claimRewards() external",
  "function getSessionInfo(address _player) external view returns (bool, uint256, uint256)",
  "function SESSION_COST() external view returns (uint256)",
  "function jackpotPool() external view returns (uint256)",
  "event SessionStarted(address indexed player, uint256 timestamp)",
  "event FishCaught(address indexed player, uint8 fishType, uint256 reward, uint256 timestamp)",
  "event JackpotWon(address indexed player, uint256 amount, uint256 timestamp)"
];

export const CounterABI = [
  "function increment(uint256 _amount) public",
  "function getCount() public view returns (uint256)",
  "function reset() public",
  "event CountChanged(uint256 newCount)"
];

export const MyTokenABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)"
];

// Contract addresses from environment
export const CONTRACTS = {
  taixiu: import.meta.env.VITE_TAIXIU_CONTRACT,
  fishing: import.meta.env.VITE_FISHING_CONTRACT,
  counter: import.meta.env.VITE_COUNTER_CONTRACT,
  mytoken: import.meta.env.VITE_MYTOKEN_CONTRACT
};

// Network config
export const NETWORK = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '296'),
  name: import.meta.env.VITE_NETWORK_NAME || 'Hera Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://testnet.hashio.io/api'
};

/**
 * Get provider (read-only)
 */
export function getProvider() {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to public RPC
  return new ethers.JsonRpcProvider(NETWORK.rpcUrl);
}

/**
 * Get signer (for transactions)
 */
export async function getSigner() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
}

/**
 * Connect wallet
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask!');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // Check network
    const chainId = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    
    if (parseInt(chainId, 16) !== NETWORK.chainId) {
      await switchNetwork();
    }

    return accounts[0];
  } catch (error) {
    console.error('Connect wallet error:', error);
    throw error;
  }
}

/**
 * Switch to correct network
 */
export async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${NETWORK.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    // Network not added, add it
    if (switchError.code === 4902) {
      await addNetwork();
    } else {
      throw switchError;
    }
  }
}

/**
 * Add network to MetaMask
 */
export async function addNetwork() {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: `0x${NETWORK.chainId.toString(16)}`,
      chainName: NETWORK.name,
      nativeCurrency: {
        name: 'HBAR',
        symbol: 'HBAR',
        decimals: 18
      },
      rpcUrls: [NETWORK.rpcUrl],
      blockExplorerUrls: ['https://testnet.hashio.io']
    }]
  });
}

/**
 * Get TaiXiu contract instance
 */
export async function getTaiXiuContract(needSigner = false) {
  if (!CONTRACTS.taixiu) {
    throw new Error('TaiXiu contract not deployed');
  }
  
  if (needSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.taixiu, TaiXiuABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(CONTRACTS.taixiu, TaiXiuABI, provider);
  }
}

/**
 * Get Fishing contract instance
 */
export async function getFishingContract(needSigner = false) {
  if (!CONTRACTS.fishing) {
    throw new Error('Fishing contract not deployed');
  }
  
  if (needSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.fishing, FishingABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(CONTRACTS.fishing, FishingABI, provider);
  }
}

/**
 * Get Counter contract instance
 */
export async function getCounterContract(needSigner = false) {
  if (!CONTRACTS.counter) {
    throw new Error('Counter contract not deployed');
  }
  
  if (needSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.counter, CounterABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(CONTRACTS.counter, CounterABI, provider);
  }
}

/**
 * Get MyToken contract instance
 */
export async function getMyTokenContract(needSigner = false) {
  if (!CONTRACTS.mytoken) {
    throw new Error('MyToken contract not deployed');
  }
  
  if (needSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.mytoken, MyTokenABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(CONTRACTS.mytoken, MyTokenABI, provider);
  }
}

/**
 * Format ether amount
 */
export function formatEther(value) {
  return ethers.formatEther(value);
}

/**
 * Parse ether amount
 */
export function parseEther(value) {
  return ethers.parseEther(value.toString());
}

/**
 * Wait for transaction
 */
export async function waitForTransaction(tx) {
  console.log('Transaction sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('Transaction confirmed:', receipt);
  return receipt;
}

/**
 * Get account balance
 */
export async function getBalance(address) {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
```

### 7.2. Main App Component

**File: `frontend/src/App.jsx`**
```jsx
import { useState, useEffect } from 'react';
import TaiXiuGame from './TaiXiuGame';
import FishingGame from './FishingGame';
import TutorialIntegration from './TutorialIntegration';
import { connectWallet } from './utils/blockchain';
import './index.css';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    setupListeners();
  }, []);

  async function checkConnection() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await updateBalance(accounts[0]);
        }
      } catch (error) {
        console.error('Check connection error:', error);
      }
    }
  }

  async function handleConnect() {
    setLoading(true);
    try {
      const address = await connectWallet();
      setAccount(address);
      setIsConnected(true);
      await updateBalance(address);
      
      // Save to backend
      await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
    } catch (error) {
      console.error('Connect error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    setAccount('');
    setIsConnected(false);
    setBalance('0');
  }

  async function updateBalance(address) {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    }
  }

  function setupListeners() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        } else {
          handleDisconnect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎮 Blockchain Gaming Platform</h1>
        <div className="wallet-section">
          {!isConnected ? (
            <button 
              className="connect-btn" 
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <>
              <div className="wallet-address">
                {account.slice(0, 6)}...{account.slice(-4)}
                <br />
                <small>{parseFloat(balance).toFixed(4)} HBAR</small>
              </div>
              <button 
                className="disconnect-btn" 
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </header>

      {!isConnected ? (
        <div className="loading">
          Please connect your wallet to play games
        </div>
      ) : (
        <>
          <section className="games-section">
            <TaiXiuGame account={account} />
            <FishingGame account={account} />
          </section>

          <section className="tutorial-section">
            <TutorialIntegration account={account} />
          </section>
        </>
      )}
    </div>
  );
}

export default App;
```

### 7.3. TaiXiuGame Component

**File: `frontend/src/TaiXiuGame.jsx`**
```jsx
import { useState, useEffect } from 'react';
import { getTaiXiuContract, parseEther, formatEther, waitForTransaction } from './utils/blockchain';

function TaiXiuGame({ account }) {
  const [betAmount, setBetAmount] = useState('0.01');
  const [betType, setBetType] = useState(0); // 0=TAI, 1=XIU
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ totalBets: '0', winnings: '0' });

  useEffect(() => {
    loadStats();
  }, [account]);

  async function loadStats() {
    try {
      const contract = await getTaiXiuContract();
      const [totalBets, winnings] = await contract.getPlayerStats(account);
      setStats({
        totalBets: formatEther(totalBets),
        winnings: formatEther(winnings)
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  async function handlePlaceBet() {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const contract = await getTaiXiuContract(true);
      
      // Place bet
      const tx = await contract.placeBet(betType, {
        value: parseEther(betAmount)
      });

      // Wait for confirmation
      const receipt = await waitForTransaction(tx);

      // Parse events
      const gameResultEvent = receipt.logs.find(
        log => log.topics[0] === contract.interface.getEvent('GameResult').topicHash
      );

      if (gameResultEvent) {
        const parsed = contract.interface.parseLog({
          topics: gameResultEvent.topics,
          data: gameResultEvent.data
        });

        const diceResult = parsed.args.diceResult.toString();
        const won = parsed.args.won;
        const payout = formatEther(parsed.args.payout);

        setResult({
          diceResult,
          won,
          payout,
          message: won ? `You won ${payout} HBAR!` : `You lost ${betAmount} HBAR`
        });

        // Save to backend
        await saveGameResult(won, payout);
        
        // Reload stats
        await loadStats();
      }
    } catch (error) {
      console.error('Place bet error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveGameResult(won, payout) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/game/save-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account,
          gameType: 'taixiu',
          betAmount: parseFloat(betAmount),
          result: result?.diceResult || '0',
          won,
          payout: parseFloat(payout),
          transactionHash: '0x...' // Add real tx hash
        })
      });
    } catch (error) {
      console.error('Save game error:', error);
    }
  }

  return (
    <div className="game-card">
      <h2>🎲 Tài Xỉu Game</h2>
      
      <div className="game-stats">
        <p>Total Bets: {parseFloat(stats.totalBets).toFixed(4)} HBAR</p>
        <p>Winnings: {parseFloat(stats.winnings).toFixed(4)} HBAR</p>
      </div>

      <div className="game-controls">
        <div>
          <label>Bet Amount (HBAR):</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            min="0.001"
            max="1"
            step="0.001"
            disabled={loading}
          />
        </div>

        <div>
          <label>Choose:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`game-btn ${betType === 0 ? 'active' : ''}`}
              onClick={() => setBetType(0)}
              disabled={loading}
            >
              Tài (11-18)
            </button>
            <button
              className={`game-btn ${betType === 1 ? 'active' : ''}`}
              onClick={() => setBetType(1)}
              disabled={loading}
            >
              Xỉu (3-10)
            </button>
          </div>
        </div>

        <button
          className="game-btn"
          onClick={handlePlaceBet}
          disabled={loading}
        >
          {loading ? 'Rolling...' : 'Place Bet'}
        </button>
      </div>

      {result && (
        <div className="game-result">
          <h3>Result</h3>
          <p>Dice Total: {result.diceResult}</p>
          <p className={result.won ? 'win' : 'lose'}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default TaiXiuGame;
```

### 7.4. FishingGame Component

**File: `frontend/src/FishingGame.jsx`**
```jsx
import { useState, useEffect } from 'react';
import { getFishingContract, parseEther, formatEther, waitForTransaction } from './utils/blockchain';

const FISH_TYPES = ['Small', 'Medium', 'Large', 'Rare', 'Epic'];

function FishingGame({ account }) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [catches, setCatches] = useState([]);
  const [jackpot, setJackpot] = useState('0');

  useEffect(() => {
    loadSessionInfo();
    loadJackpot();
  }, [account]);

  async function loadSessionInfo() {
    try {
      const contract = await getFishingContract();
      const [active, casts, reward] = await contract.getSessionInfo(account);
      
      if (active) {
        setSession({
          active,
          castsRemaining: casts.toString(),
          totalReward: formatEther(reward)
        });
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Load session error:', error);
    }
  }

  async function loadJackpot() {
    try {
      const contract = await getFishingContract();
      const pool = await contract.jackpotPool();
      setJackpot(formatEther(pool));
    } catch (error) {
      console.error('Load jackpot error:', error);
    }
  }

  async function handleStartSession() {
    setLoading(true);
    try {
      const contract = await getFishingContract(true);
      const sessionCost = await contract.SESSION_COST();
      
      const tx = await contract.startSession({
        value: sessionCost
      });

      await waitForTransaction(tx);
      
      setCatches([]);
      await loadSessionInfo();
      await loadJackpot();
    } catch (error) {
      console.error('Start session error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCastLine() {
    setLoading(true);
    try {
      const contract = await getFishingContract(true);
      const tx = await contract.castLine();
      const receipt = await waitForTransaction(tx);

      // Parse FishCaught event
      const fishEvent = receipt.logs.find(
        log => log.topics[0] === contract.interface.getEvent('FishCaught').topicHash
      );

      if (fishEvent) {
        const parsed = contract.interface.parseLog({
          topics: fishEvent.topics,
          data: fishEvent.data
        });

        const fishType = parseInt(parsed.args.fishType);
        const reward = formatEther(parsed.args.reward);

        setCatches(prev => [...prev, {
          type: FISH_TYPES[fishType],
          reward
        }]);
      }

      // Check for jackpot event
      const jackpotEvent = receipt.logs.find(
        log => log.topics[0] === contract.interface.getEvent('JackpotWon').topicHash
      );

      if (jackpotEvent) {
        const parsed = contract.interface.parseLog({
          topics: jackpotEvent.topics,
          data: jackpotEvent.data
        });
        alert(`🎉 JACKPOT WON! ${formatEther(parsed.args.amount)} HBAR!`);
      }

      await loadSessionInfo();
      await loadJackpot();
    } catch (error) {
      console.error('Cast line error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEndSession() {
    setLoading(true);
    try {
      const contract = await getFishingContract(true);
      const tx = await contract.endSession();
      await waitForTransaction(tx);
      
      await loadSessionInfo();
    } catch (error) {
      console.error('End session error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimRewards() {
    setLoading(true);
    try {
      const contract = await getFishingContract(true);
      const tx = await contract.claimRewards();
      await waitForTransaction(tx);
      
      alert('Rewards claimed successfully!');
      setCatches([]);
    } catch (error) {
      console.error('Claim rewards error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="game-card">
      <h2>🎣 Fishing Game</h2>
      
      <div className="game-stats">
        <p>Jackpot Pool: {parseFloat(jackpot).toFixed(4)} HBAR</p>
      </div>

      <div className="game-controls">
        {!session ? (
          <button
            className="game-btn"
            onClick={handleStartSession}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Session (0.01 HBAR)'}
          </button>
        ) : (
          <>
            <p>Casts Remaining: {session.castsRemaining}</p>
            <p>Total Reward: {parseFloat(session.totalReward).toFixed(4)} HBAR</p>
            
            <button
              className="game-btn"
              onClick={handleCastLine}
              disabled={loading || session.castsRemaining === '0'}
            >
              {loading ? 'Casting...' : 'Cast Line'}
            </button>

            <button
              className="game-btn"
              onClick={handleEndSession}
              disabled={loading}
            >
              End Session
            </button>

            <button
              className="game-btn"
              onClick={handleClaimRewards}
              disabled={loading || session.active}
            >
              Claim Rewards
            </button>
          </>
        )}
      </div>

      {catches.length > 0 && (
        <div className="game-result">
          <h3>Catches:</h3>
          {catches.map((catch_, idx) => (
            <p key={idx}>
              {catch_.type} Fish - {parseFloat(catch_.reward).toFixed(4)} HBAR
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default FishingGame;
```

### 7.5. TutorialIntegration Component

**File: `frontend/src/TutorialIntegration.jsx`**
```jsx
import { useState, useEffect } from 'react';
import { getCounterContract, getMyTokenContract, waitForTransaction } from './utils/blockchain';

function TutorialIntegration({ account }) {
  const [counter, setCounter] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [account]);

  async function loadData() {
    await Promise.all([loadCounter(), loadTokenBalance()]);
  }

  async function loadCounter() {
    try {
      const contract = await getCounterContract();
      const count = await contract.getCount();
      setCounter(count.toString());
    } catch (error) {
      console.error('Load counter error:', error);
    }
  }

  async function loadTokenBalance() {
    try {
      const contract = await getMyTokenContract();
      const balance = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      setTokenBalance((Number(balance) / 10 ** Number(decimals)).toFixed(2));
    } catch (error) {
      console.error('Load token balance error:', error);
    }
  }

  async function incrementCounter(amount) {
    setLoading(true);
    try {
      const contract = await getCounterContract(true);
      const tx = await contract.increment(amount);
      await waitForTransaction(tx);
      await loadCounter();
    } catch (error) {
      console.error('Increment error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>📚 Hardhat Tutorial Integration</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Counter */}
        <div className="tutorial-card">
          <h3>Counter Contract</h3>
          <p>Current Count: <strong>{counter}</strong></p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              className="game-btn"
              onClick={() => incrementCounter(1)}
              disabled={loading}
            >
              +1
            </button>
            <button
              className="game-btn"
              onClick={() => incrementCounter(5)}
              disabled={loading}
            >
              +5
            </button>
            <button
              className="game-btn"
              onClick={() => incrementCounter(10)}
              disabled={loading}
            >
              +10
            </button>
          </div>
        </div>

        {/* MyToken */}
        <div className="tutorial-card">
          <h3>MyToken (MTK)</h3>
          <p>Your Balance: <strong>{tokenBalance} MTK</strong></p>
          
          <button
            className="game-btn"
            onClick={loadTokenBalance}
            disabled={loading}
            style={{ marginTop: '15px' }}
          >
            Refresh Balance
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialIntegration;
```

---

## 8. DEPLOY LÊN TESTNET

### 8.1. Tạo Deploy Scripts

**File: `scripts/deploy-all.js`**
```javascript
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy TaiXiuGame
  console.log("📦 Deploying TaiXiuGame...");
  const TaiXiuGame = await hre.ethers.getContractFactory("TaiXiuGame");
  const taixiu = await TaiXiuGame.deploy();
  await taixiu.waitForDeployment();
  const taixiuAddress = await taixiu.getAddress();
  console.log("✅ TaiXiuGame deployed to:", taixiuAddress);

  // Fund TaiXiu house
  console.log("💵 Funding TaiXiu house with 1 ETH...");
  const fundTx = await taixiu.fundHouse({ value: hre.ethers.parseEther("1") });
  await fundTx.wait();
  console.log("✅ House funded\n");

  // Deploy FishingGame
  console.log("📦 Deploying FishingGame...");
  const FishingGame = await hre.ethers.getContractFactory("FishingGame");
  const fishing = await FishingGame.deploy();
  await fishing.waitForDeployment();
  const fishingAddress = await fishing.getAddress();
  console.log("✅ FishingGame deployed to:", fishingAddress);

  // Fund Fishing jackpot
  console.log("💵 Funding Fishing jackpot with 0.5 ETH...");
  const fundJackpotTx = await fishing.fundJackpot({ value: hre.ethers.parseEther("0.5") });
  await fundJackpotTx.wait();
  console.log("✅ Jackpot funded\n");

  // Deploy Counter
  console.log("📦 Deploying Counter...");
  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  const counterAddress = await counter.getAddress();
  console.log("✅ Counter deployed to:", counterAddress, "\n");

  // Deploy MyToken
  console.log("📦 Deploying MyToken...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const mytoken = await MyToken.deploy();
  await mytoken.waitForDeployment();
  const mytokenAddress = await mytoken.getAddress();
  console.log("✅ MyToken deployed to:", mytokenAddress, "\n");

  // Prepare deployment info
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  const deploymentInfo = {
    network,
    chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      taixiu: taixiuAddress,
      fishing: fishingAddress,
      counter: counterAddress,
      mytoken: mytokenAddress
    }
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = path.join(deploymentsDir, `${network}-${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Deployment info saved to:", filename);

  // Create .env file for frontend
  const envContent = `
# Gaming Contracts
VITE_TAIXIU_CONTRACT=${taixiuAddress}
VITE_FISHING_CONTRACT=${fishingAddress}

# Tutorial Contracts
VITE_COUNTER_CONTRACT=${counterAddress}
VITE_MYTOKEN_CONTRACT=${mytokenAddress}

# Network
VITE_CHAIN_ID=${chainId}
VITE_NETWORK_NAME=${network}
VITE_RPC_URL=${hre.network.config.url}

# Backend
VITE_API_URL=http://localhost:5000
`.trim();

  const frontendEnvPath = path.join(__dirname, '../frontend/.env.deployment');
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("📝 Frontend .env file created at:", frontendEnvPath);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("  TaiXiuGame: ", taixiuAddress);
  console.log("  FishingGame:", fishingAddress);
  console.log("  Counter:    ", counterAddress);
  console.log("  MyToken:    ", mytokenAddress);
  console.log("\n📍 Network:", network, `(Chain ID: ${chainId})`);
  console.log("\n✅ Next steps:");
  console.log("  1. Copy frontend/.env.deployment to frontend/.env");
  console.log("  2. Start backend: npm run dev");
  console.log("  3. Start frontend: npm run frontend");
  console.log("  4. Open http://localhost:5173");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 8.2. Verify Deployment Script

**File: `scripts/verify-deployment.js`**
```javascript
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verifying deployment...\n");

  // Read latest deployment
  const deploymentsDir = path.join(__dirname, '../deployments');
  const files = fs.readdirSync(deploymentsDir);
  const latestFile = files.sort().reverse()[0];
  
  if (!latestFile) {
    console.log("❌ No deployment found");
    return;
  }

  const deployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, latestFile), 'utf8')
  );

  console.log("📋 Deployment Info:");
  console.log("  Network:", deployment.network);
  console.log("  Chain ID:", deployment.chainId);
  console.log("  Deployer:", deployment.deployer);
  console.log("  Time:", deployment.timestamp);
  console.log();

  // Verify each contract
  for (const [name, address] of Object.entries(deployment.contracts)) {
    await verifyContract(name, address);
  }

  console.log("\n✅ Verification complete!");
}

async function verifyContract(name, address) {
  try {
    console.log(`Checking ${name} at ${address}...`);
    const code = await hre.ethers.provider.getCode(address);
    
    if (code === '0x') {
      console.log(`  ❌ No contract found at address`);
    } else {
      console.log(`  ✅ Contract verified`);
    }
  } catch (error) {
    console.log(`  ❌ Error:`, error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 8.3. Deploy Commands

```powershell
# Compile contracts
npm run compile

# Deploy to Hera testnet
npm run deploy:all:hera

# Verify deployment
npm run verify:deployment

# Copy environment variables
copy frontend\.env.deployment frontend\.env
```

---

## 9. TESTING & DEBUGGING

### 9.1. Contract Tests

**File: `test/TaiXiuGame.test.js`**
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaiXiuGame", function () {
  let taixiu;
  let owner;
  let player1;

  beforeEach(async function () {
    [owner, player1] = await ethers.getSigners();
    
    const TaiXiuGame = await ethers.getContractFactory("TaiXiuGame");
    taixiu = await TaiXiuGame.deploy();
    await taixiu.waitForDeployment();
    
    // Fund house
    await taixiu.fundHouse({ value: ethers.parseEther("10") });
  });

  it("Should accept bets", async function () {
    const betAmount = ethers.parseEther("0.01");
    
    await expect(
      taixiu.connect(player1).placeBet(0, { value: betAmount })
    ).to.not.be.reverted;
  });

  it("Should reject bets below minimum", async function () {
    const betAmount = ethers.parseEther("0.0001");
    
    await expect(
      taixiu.connect(player1).placeBet(0, { value: betAmount })
    ).to.be.revertedWith("Bet too small");
  });

  it("Should track player stats", async function () {
    const betAmount = ethers.parseEther("0.01");
    await taixiu.connect(player1).placeBet(0, { value: betAmount });
    
    const [totalBets, winnings] = await taixiu.getPlayerStats(player1.address);
    expect(totalBets).to.equal(betAmount);
  });
});
```

### 9.2. Run Tests

```powershell
# Run all tests
npm test

# Run specific test
npx hardhat test test/TaiXiuGame.test.js

# Coverage
npm run coverage
```

---

## 10. DEPLOY PRODUCTION

### 10.1. Security Checklist

- [ ] Change all private keys
- [ ] Update JWT secret
- [ ] Remove test accounts
- [ ] Enable rate limiting
- [ ] Add API authentication
- [ ] Audit smart contracts
- [ ] Use Chainlink VRF for randomness
- [ ] Setup monitoring

### 10.2. Deploy to Mainnet

**⚠️ KHÔNG deploy lên mainnet cho đến khi:**
1. Audit đầy đủ smart contracts
2. Test kỹ trên testnet
3. Có bảo hiểm cho smart contracts
4. Replace pseudo-random bằng Chainlink VRF

---

## 🎉 KẾT THÚC

Bạn đã hoàn thành dự án Blockchain Gaming Platform từ A-Z!

**Những gì đã làm được:**
✅ Smart contracts (TaiXiuGame, FishingGame, Counter, MyToken)
✅ Backend API với Express + MongoDB
✅ Frontend React với Web3 integration
✅ MetaMask integration
✅ Deploy lên testnet
✅ Testing & debugging

**Next Steps:**
- Thêm features mới
- UI/UX improvements
- Mobile responsive
- Social features
- NFT rewards
- More games

**Good luck với dự án!** 🚀
