import { ethers } from 'ethers'

// Contract ABIs (exported from compiled contracts)
export const TAIXIU_ABI = [
  "function gameCounter() view returns (uint256)",
  "function placeBet(uint8 betType) payable",
  "function getCurrentGame() view returns (tuple(uint256 gameId, uint8 status, uint256 totalTaiBets, uint256 totalXiuBets, uint256 dice1, uint256 dice2, uint256 dice3, uint256 totalDice, uint256 timestamp, bool resolved))",
  "function getGameBets(uint256 gameId) view returns (tuple(address player, uint256 amount, uint8 betType, uint256 timestamp)[])",
  "function getPlayerBalance(address player) view returns (uint256)",
  "function withdraw()",
  "function playerTotalBets(address) view returns (uint256)",
  "event GameCreated(uint256 indexed gameId, uint256 timestamp)",
  "event BetPlaced(uint256 indexed gameId, address indexed player, uint256 amount, uint8 betType)",
  "event GameResolved(uint256 indexed gameId, uint256 dice1, uint256 dice2, uint256 dice3, uint256 total, bool isTai)",
  "event WinningsPaid(address indexed player, uint256 amount)"
]

export const FISHING_ABI = [
  "function startSession() payable",
  "function catchFish()",
  "function endSession()",
  "function claimRewards()",
  "function getActiveSession(address player) view returns (tuple(address player, uint256 sessionId, uint256 fishCaught, uint256 rareFishCaught, uint256 totalEarned, uint256 startTime, uint256 endTime, bool active))",
  "function getCatchHistory(address player) view returns (tuple(uint8 fishType, uint256 reward, uint256 timestamp)[])",
  "function getLeaderboard() view returns (address[], uint256[])",
  "function playerEarnings(address) view returns (uint256)",
  "function jackpotPool() view returns (uint256)",
  "event SessionStarted(address indexed player, uint256 sessionId, uint256 timestamp)",
  "event FishCaught(address indexed player, uint8 fishType, uint256 reward)",
  "event SessionEnded(address indexed player, uint256 fishCaught, uint256 totalEarned)",
  "event JackpotWon(address indexed player, uint256 amount)"
]

// Contract addresses (update after deployment)
export const CONTRACTS = {
  localhost: {
    TaiXiuGame: import.meta.env.VITE_TAIXIU_CONTRACT || '',
    FishingGame: import.meta.env.VITE_FISHING_CONTRACT || ''
  },
  sepolia: {
    TaiXiuGame: import.meta.env.VITE_TAIXIU_CONTRACT_SEPOLIA || '',
    FishingGame: import.meta.env.VITE_FISHING_CONTRACT_SEPOLIA || ''
  }
}

// Get provider and signer
export async function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider
}

export async function getSigner() {
  const provider = await getProvider()
  const signer = await provider.getSigner()
  return signer
}

// Get network
export async function getNetwork() {
  const provider = await getProvider()
  const network = await provider.getNetwork()
  return network
}

// Get contract instance
export async function getTaiXiuContract() {
  const signer = await getSigner()
  const network = await getNetwork()
  const networkName = network.chainId === 11155111n ? 'sepolia' : 'localhost'
  const address = CONTRACTS[networkName]?.TaiXiuGame
  
  if (!address) throw new Error('TaiXiuGame contract not deployed on this network')
  
  return new ethers.Contract(address, TAIXIU_ABI, signer)
}

export async function getFishingContract() {
  const signer = await getSigner()
  const network = await getNetwork()
  const networkName = network.chainId === 11155111n ? 'sepolia' : 'localhost'
  const address = CONTRACTS[networkName]?.FishingGame
  
  if (!address) throw new Error('FishingGame contract not deployed on this network')
  
  return new ethers.Contract(address, FISHING_ABI, signer)
}

// Helper functions for TaiXiu
export async function placeTaiXiuBet(betType, amount) {
  const contract = await getTaiXiuContract()
  const tx = await contract.placeBet(betType, {
    value: ethers.parseEther(amount.toString())
  })
  await tx.wait()
  return tx
}

export async function getCurrentTaiXiuGame() {
  const contract = await getTaiXiuContract()
  const game = await contract.getCurrentGame()
  return {
    gameId: Number(game.gameId),
    status: Number(game.status),
    totalTaiBets: ethers.formatEther(game.totalTaiBets),
    totalXiuBets: ethers.formatEther(game.totalXiuBets),
    dice1: Number(game.dice1),
    dice2: Number(game.dice2),
    dice3: Number(game.dice3),
    totalDice: Number(game.totalDice),
    resolved: game.resolved
  }
}

export async function getTaiXiuPlayerBalance(address) {
  const contract = await getTaiXiuContract()
  const balance = await contract.getPlayerBalance(address)
  return ethers.formatEther(balance)
}

export async function withdrawTaiXiuWinnings() {
  const contract = await getTaiXiuContract()
  const tx = await contract.withdraw()
  await tx.wait()
  return tx
}

// Helper functions for Fishing
export async function startFishingSession() {
  const contract = await getFishingContract()
  const tx = await contract.startSession({
    value: ethers.parseEther('0.001')
  })
  await tx.wait()
  return tx
}

export async function catchFish() {
  const contract = await getFishingContract()
  const tx = await contract.catchFish()
  await tx.wait()
  return tx
}

export async function endFishingSession() {
  const contract = await getFishingContract()
  const tx = await contract.endSession()
  await tx.wait()
  return tx
}

export async function claimFishingRewards() {
  const contract = await getFishingContract()
  const tx = await contract.claimRewards()
  await tx.wait()
  return tx
}

export async function getFishingSession(address) {
  const contract = await getFishingContract()
  const session = await contract.getActiveSession(address)
  return {
    sessionId: Number(session.sessionId),
    fishCaught: Number(session.fishCaught),
    rareFishCaught: Number(session.rareFishCaught),
    totalEarned: ethers.formatEther(session.totalEarned),
    active: session.active
  }
}

export async function getFishingLeaderboard() {
  const contract = await getFishingContract()
  const [players, scores] = await contract.getLeaderboard()
  return players.map((player, i) => ({
    address: player,
    score: ethers.formatEther(scores[i])
  }))
}

export async function getFishingPlayerEarnings(address) {
  const contract = await getFishingContract()
  const earnings = await contract.playerEarnings(address)
  return ethers.formatEther(earnings)
}

// Event listeners
export function listenToTaiXiuEvents(contract, callbacks) {
  if (callbacks.onBetPlaced) {
    contract.on('BetPlaced', (gameId, player, amount, betType, event) => {
      callbacks.onBetPlaced({
        gameId: Number(gameId),
        player,
        amount: ethers.formatEther(amount),
        betType: Number(betType),
        txHash: event.log.transactionHash
      })
    })
  }
  
  if (callbacks.onGameResolved) {
    contract.on('GameResolved', (gameId, dice1, dice2, dice3, total, isTai, event) => {
      callbacks.onGameResolved({
        gameId: Number(gameId),
        dice1: Number(dice1),
        dice2: Number(dice2),
        dice3: Number(dice3),
        total: Number(total),
        isTai,
        txHash: event.log.transactionHash
      })
    })
  }
}

export function listenToFishingEvents(contract, callbacks) {
  if (callbacks.onFishCaught) {
    contract.on('FishCaught', (player, fishType, reward, event) => {
      callbacks.onFishCaught({
        player,
        fishType: Number(fishType),
        reward: ethers.formatEther(reward),
        txHash: event.log.transactionHash
      })
    })
  }
  
  if (callbacks.onJackpot) {
    contract.on('JackpotWon', (player, amount, event) => {
      callbacks.onJackpot({
        player,
        amount: ethers.formatEther(amount),
        txHash: event.log.transactionHash
      })
    })
  }
}

// Format address
export function shortAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format ETH amount
export function formatEth(wei, decimals = 4) {
  return parseFloat(ethers.formatEther(wei)).toFixed(decimals)
}
