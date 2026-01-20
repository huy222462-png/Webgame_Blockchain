import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getBomdogContract, BOMDOG_ABI } from '../utils/blockchain'

/**
 * React Hook để tương tác với BomdogGame contract
 * @param {string} account - Địa chỉ ví người dùng
 * @returns {Object} Contract instance và các hàm helper
 */
export function useBomdogContract(account) {
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [playerData, setPlayerData] = useState(null)

  // Khởi tạo contract
  useEffect(() => {
    async function initContract() {
      if (!account || !window.ethereum) {
        setContract(null)
        return
      }

      try {
        const contractInstance = await getBomdogContract()
        setContract(contractInstance)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize contract:', err)
        setError(err.message)
      }
    }

    initContract()
  }, [account])

  // Load player data
  const loadPlayerData = async () => {
    if (!contract || !account) return null

    try {
      setLoading(true)
      const data = await contract.getPlayer(account)
      
      const playerInfo = {
        level: Number(data[0]),
        clickPower: Number(data[1]),
        idleIncome: Number(data[2]),
        totalCoins: Number(data[3]),
        lastClaim: Number(data[4])
      }
      
      setPlayerData(playerInfo)
      setError(null)
      return playerInfo
    } catch (err) {
      console.error('Failed to load player data:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Đăng ký player mới
  const registerPlayer = async () => {
    if (!contract) throw new Error('Contract not initialized')

    try {
      setLoading(true)
      const tx = await contract.registerPlayer()
      await tx.wait()
      await loadPlayerData()
      setError(null)
      return tx
    } catch (err) {
      console.error('Failed to register player:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Click để kiếm coin
  const earnClick = async () => {
    if (!contract) throw new Error('Contract not initialized')

    try {
      setLoading(true)
      const tx = await contract.earnClick()
      await tx.wait()
      await loadPlayerData()
      setError(null)
      return tx
    } catch (err) {
      console.error('Failed to earn click:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Claim idle coins
  const claimIdle = async () => {
    if (!contract) throw new Error('Contract not initialized')

    try {
      setLoading(true)
      const tx = await contract.claimIdle()
      await tx.wait()
      await loadPlayerData()
      setError(null)
      return tx
    } catch (err) {
      console.error('Failed to claim idle:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Upgrade click power
  const upgradeClick = async () => {
    if (!contract) throw new Error('Contract not initialized')

    try {
      setLoading(true)
      const tx = await contract.upgradeClick()
      await tx.wait()
      await loadPlayerData()
      setError(null)
      return tx
    } catch (err) {
      console.error('Failed to upgrade click:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Upgrade idle income
  const upgradeIdle = async () => {
    if (!contract) throw new Error('Contract not initialized')

    try {
      setLoading(true)
      const tx = await contract.upgradeIdle()
      await tx.wait()
      await loadPlayerData()
      setError(null)
      return tx
    } catch (err) {
      console.error('Failed to upgrade idle:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Listen to events
  useEffect(() => {
    if (!contract || !account) return

    const handleClickEarned = (player, amount, newTotal) => {
      if (player.toLowerCase() === account.toLowerCase()) {
        loadPlayerData()
      }
    }

    const handleIdleClaimed = (player, amount, newTotal) => {
      if (player.toLowerCase() === account.toLowerCase()) {
        loadPlayerData()
      }
    }

    const handleUpgrade = (player) => {
      if (player.toLowerCase() === account.toLowerCase()) {
        loadPlayerData()
      }
    }

    contract.on('ClickEarned', handleClickEarned)
    contract.on('IdleClaimed', handleIdleClaimed)
    contract.on('ClickUpgraded', handleUpgrade)
    contract.on('IdleUpgraded', handleUpgrade)

    return () => {
      contract.off('ClickEarned', handleClickEarned)
      contract.off('IdleClaimed', handleIdleClaimed)
      contract.off('ClickUpgraded', handleUpgrade)
      contract.off('IdleUpgraded', handleUpgrade)
    }
  }, [contract, account])

  return {
    contract,
    loading,
    error,
    playerData,
    // Functions
    loadPlayerData,
    registerPlayer,
    earnClick,
    claimIdle,
    upgradeClick,
    upgradeIdle
  }
}
