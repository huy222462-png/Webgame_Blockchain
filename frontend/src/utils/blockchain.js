import { ethers } from 'ethers'

// Contract ABI cho BomdogGame
export const BOMDOG_ABI = [
  'function registerPlayer()',
  'function earnClick()',
  'function claimIdle()',
  'function upgradeClick()',
  'function upgradeIdle()',
  'function getPlayer(address player) view returns (uint256 level, uint256 clickPower, uint256 idleIncome, uint256 totalCoins, uint256 lastClaim)'
]

// Contract addresses (update sau khi deploy)
export const CONTRACTS = {
  localhost: {
    BomdogGame: import.meta.env.VITE_BOMDOG_CONTRACT || ''
  },
  sepolia: {
    BomdogGame: import.meta.env.VITE_BOMDOG_CONTRACT_SEPOLIA || import.meta.env.VITE_BOMDOG_CONTRACT || ''
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

// Get Bomdog contract instance
export async function getBomdogContract() {
  const signer = await getSigner()
  const network = await getNetwork()
  const networkName = network.chainId === 11155111n ? 'sepolia' : 'localhost'
  const address = CONTRACTS[networkName]?.BomdogGame
  
  if (!address) throw new Error('BomdogGame contract not deployed on this network')
  
  return new ethers.Contract(address, BOMDOG_ABI, signer)
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
