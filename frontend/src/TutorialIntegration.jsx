import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import ABIs from hardhat-tutorial
// Adjust paths based on your actual structure
const CounterABI = [
  "function x() view returns (uint)",
  "function inc() external",
  "function incBy(uint by) external",
  "event Increment(uint by)"
];

const MyTokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

function TutorialIntegration() {
  const [counter, setCounter] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');

  // Get contract addresses from environment variables
  const counterAddress = import.meta.env.VITE_COUNTER_CONTRACT || '';
  const tokenAddress = import.meta.env.VITE_MYTOKEN_CONTRACT || '0x73C6C18b1EDEB8319cA52f02f948c35FA8177401';

  useEffect(() => {
    if (window.ethereum) {
      loadData();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountChanged);
      }
    };
  }, []);

  async function handleAccountChanged(accounts) {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await loadData();
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // Load Counter data
      if (counterAddress) {
        try {
          const counterContract = new ethers.Contract(counterAddress, CounterABI, provider);
          const x = await counterContract.x();
          setCounter(x.toString());
        } catch (err) {
          console.error('Counter contract error:', err);
        }
      }

      // Load MyToken data
      if (tokenAddress) {
        try {
          const tokenContract = new ethers.Contract(tokenAddress, MyTokenABI, provider);
          const balance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();
          
          setTokenBalance(ethers.formatUnits(balance, decimals));
          setTokenSymbol(symbol);
        } catch (err) {
          console.error('Token contract error:', err);
        }
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function incrementCounter() {
    try {
      setLoading(true);
      setError('');

      if (!counterAddress) {
        setError('Counter contract address not configured');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(counterAddress, CounterABI, signer);

      const tx = await contract.inc();
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed!');
      
      await loadData();
    } catch (err) {
      console.error('Increment error:', err);
      setError(err.message || 'Failed to increment counter');
    } finally {
      setLoading(false);
    }
  }

  async function incrementBy(amount) {
    try {
      setLoading(true);
      setError('');

      if (!counterAddress) {
        setError('Counter contract address not configured');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(counterAddress, CounterABI, signer);

      const tx = await contract.incBy(amount);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed!');
      
      await loadData();
    } catch (err) {
      console.error('Increment error:', err);
      setError(err.message || 'Failed to increment counter');
    } finally {
      setLoading(false);
    }
  }

  if (!window.ethereum) {
    return (
      <div className="tutorial-integration">
        <h2>🎓 Hardhat Tutorial Integration</h2>
        <div className="error-message">
          ⚠️ Please install MetaMask to use this feature
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial-integration">
      <h2>🎓 Hardhat Tutorial Integration</h2>
      
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
        {/* Counter Widget */}
        {counterAddress ? (
          <div className="widget counter-widget">
            <h3>📊 Counter Contract</h3>
            <div className="widget-content">
              <div className="counter-display">
                <span className="counter-value">{counter}</span>
                <span className="counter-label">Current Value</span>
              </div>
              <div className="button-group">
                <button 
                  onClick={incrementCounter} 
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Processing...' : '+1'}
                </button>
                <button 
                  onClick={() => incrementBy(5)} 
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  {loading ? 'Processing...' : '+5'}
                </button>
                <button 
                  onClick={() => incrementBy(10)} 
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  {loading ? 'Processing...' : '+10'}
                </button>
              </div>
              <div className="contract-address">
                <small>Contract: {counterAddress.slice(0, 8)}...{counterAddress.slice(-6)}</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="widget counter-widget disabled">
            <h3>📊 Counter Contract</h3>
            <p>⚠️ Not configured. Set VITE_COUNTER_CONTRACT in .env</p>
          </div>
        )}

        {/* Token Widget */}
        {tokenAddress ? (
          <div className="widget token-widget">
            <h3>🪙 MyToken ({tokenSymbol})</h3>
            <div className="widget-content">
              <div className="token-display">
                <span className="token-value">{parseFloat(tokenBalance).toFixed(2)}</span>
                <span className="token-symbol">{tokenSymbol}</span>
              </div>
              <button 
                onClick={loadData} 
                disabled={loading}
                className="btn btn-refresh"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
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
        <h4>ℹ️ About These Contracts</h4>
        <ul>
          <li><strong>Counter:</strong> Simple increment contract from Hardhat tutorial</li>
          <li><strong>MyToken:</strong> ERC20 token (HBAR) deployed on testnet</li>
          <li>Both contracts are part of the Hardhat 3 Beta learning project</li>
        </ul>
      </div>

      <style jsx>{`
        .tutorial-integration {
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          margin: 2rem 0;
        }

        .tutorial-integration h2 {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .account-info {
          text-align: center;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .error-message {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.5);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .tutorial-widgets {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .widget {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .widget.disabled {
          opacity: 0.6;
        }

        .widget h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .widget-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .counter-display, .token-display {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .counter-value, .token-value {
          display: block;
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .counter-label, .token-symbol {
          display: block;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #10b981;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #3b82f6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .btn-refresh {
          background: #8b5cf6;
          color: white;
          width: 100%;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #7c3aed;
        }

        .contract-address {
          text-align: center;
          opacity: 0.7;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .tutorial-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tutorial-info h4 {
          margin-bottom: 1rem;
        }

        .tutorial-info ul {
          list-style-position: inside;
          line-height: 1.8;
        }

        .tutorial-info li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default TutorialIntegration;
