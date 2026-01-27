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

const NETWORK_PRESETS = {
  localhost: {
    name: 'localhost',
    displayName: 'Localhost (Hardhat)',
    chainId: 31337n,
    hexChainId: '0x7a69',
    contractAddress: import.meta.env.VITE_BOMDOG_CONTRACT || ''
  },
  sepolia: {
    name: 'sepolia',
    displayName: 'Sepolia',
    chainId: 11155111n,
    hexChainId: '0xaa36a7',
    contractAddress: import.meta.env.VITE_BOMDOG_CONTRACT_SEPOLIA || ''
  },
  polygonAmoy: {
    name: 'polygonAmoy',
    displayName: 'Polygon Amoy',
    chainId: 200810n,
    hexChainId: '0x3106a',
    contractAddress:
      import.meta.env.VITE_BOMDOG_CONTRACT_POLYGON_AMOY ||
      import.meta.env.VITE_BOMDOG_CONTRACT_AMOY ||
      ''
  }
}

const defaultNetworkKey = (import.meta.env.VITE_DEFAULT_NETWORK || '').toLowerCase()

let activeNetwork = NETWORK_PRESETS[defaultNetworkKey]

if (!activeNetwork || !activeNetwork.contractAddress) {
  const configured = Object.values(NETWORK_PRESETS).find(net => net.contractAddress)
  activeNetwork = configured || NETWORK_PRESETS.localhost
}

export const ACTIVE_NETWORK = activeNetwork
export const BOMDOG_ADDRESS = ACTIVE_NETWORK.contractAddress
export const EXPECTED_NETWORK_LABEL = ACTIVE_NETWORK.displayName || ACTIVE_NETWORK.name
export const EXPECTED_CHAIN_ID = BOMDOG_ADDRESS ? ACTIVE_NETWORK.chainId : null
export const EXPECTED_CHAIN_HEX = BOMDOG_ADDRESS ? ACTIVE_NETWORK.hexChainId : null

// Get provider and signer
export async function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  return new ethers.BrowserProvider(window.ethereum)
}

export async function ensureCorrectNetwork({ attemptSwitch = true } = {}) {
  let provider = await getProvider()
  let network = await provider.getNetwork()

  if (!EXPECTED_CHAIN_ID) {
    return { provider, network }
  }

  if (network.chainId === EXPECTED_CHAIN_ID) {
    return { provider, network }
  }

  if (attemptSwitch && window.ethereum?.request && EXPECTED_CHAIN_HEX) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_HEX }]
      })
      provider = await getProvider()
      network = await provider.getNetwork()
      if (network.chainId === EXPECTED_CHAIN_ID) {
        return { provider, network }
      }
    } catch (switchError) {
      throw Object.assign(new Error('Sai mạng blockchain'), { cause: switchError })
    }
  }

  throw new Error('Sai mạng blockchain')
}

export async function getSigner(options = {}) {
  const { provider } = await ensureCorrectNetwork(options)
  return provider.getSigner()
}

// Get network
export async function getNetwork() {
  const provider = await getProvider()
  return provider.getNetwork()
}

// Get Bomdog contract instance
export async function getBomdogContract(options = {}) {
  const { optional = false } = options

  if (!BOMDOG_ADDRESS) {
    if (optional) return null
    throw new Error('Chưa cấu hình địa chỉ BomdogGame cho mạng này')
  }

  const signer = await getSigner(options)
  return new ethers.Contract(BOMDOG_ADDRESS, BOMDOG_ABI, signer)
}

export function isExpectedChain(chainId) {
  if (!EXPECTED_CHAIN_ID) return true
  const parsed = parseChainId(chainId)
  return parsed === EXPECTED_CHAIN_ID
}

export function parseChainId(chainId) {
  try {
    if (chainId === undefined || chainId === null) return null
    if (typeof chainId === 'bigint') return chainId
    if (typeof chainId === 'number') return BigInt(chainId)
    if (typeof chainId === 'string') return BigInt(chainId)
    return null
  } catch (err) {
    console.warn('Không thể parse chainId', err, chainId)
    return null
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
