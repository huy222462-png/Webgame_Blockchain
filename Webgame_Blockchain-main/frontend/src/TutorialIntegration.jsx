import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TutorialIntegration.css';

const MyTokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

function TutorialIntegration() {
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');

  const tokenAddress = import.meta.env.VITE_MYTOKEN_CONTRACT || '0x73C6C18b1EDEB8319cA52f02f948c35FA8177401';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        setError('Please connect MetaMask');
        return;
      }

      const address = accounts[0];
      setAccount(address);

      // Load MyToken data
      if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          const tokenContract = new ethers.Contract(tokenAddress, MyTokenABI, provider);
          const balance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();
          
          setTokenBalance(ethers.formatUnits(balance, decimals));
          setTokenSymbol(symbol);
        } catch (err) {
          console.error('Token contract error:', err);
          setError('Could not load token data: ' + err.message);
        }
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutorial-integration">
      <h2>🎓 MyToken Contract (HBAR)</h2>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {account && (
        <div className="account-info">
          <strong>Connected:</strong> {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}

      <div className="tutorial-widgets">
        {tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000' ? (
          <div className="widget token-widget">
            <h3>🪙 MyToken ({tokenSymbol || 'HBAR'})</h3>
            <div className="widget-content">
              <div className="token-display">
                <span className="token-value">{parseFloat(tokenBalance).toFixed(2)}</span>
                <span className="token-symbol">{tokenSymbol || 'HBAR'}</span>
              </div>
              <button 
                onClick={loadData} 
                disabled={loading}
                className="btn btn-refresh"
              >
                {loading ? 'Loading...' : '🔄 Refresh Balance'}
              </button>
              <div className="contract-address">
                <small>Contract: {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-6)}</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="widget token-widget disabled">
            <h3>🪙 MyToken</h3>
            <p>⚠️ Not configured. Set VITE_MYTOKEN_CONTRACT in .env</p>
          </div>
        )}
      </div>

      <div className="tutorial-info">
        <h4>ℹ️ About MyToken Contract</h4>
        <ul>
          <li><strong>Contract:</strong> ERC20 token (HBAR) deployed on Hera Testnet</li>
          <li><strong>Network:</strong> Hera Testnet (Chain ID: 296)</li>
          <li><strong>Explorer:</strong> <a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer" style={{color: 'white'}}>HashScan.io/testnet</a></li>
        </ul>
      </div>
    </div>
  );
}

export default TutorialIntegration;

