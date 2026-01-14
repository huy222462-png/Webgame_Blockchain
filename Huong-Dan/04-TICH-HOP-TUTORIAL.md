# Cập Nhật App.jsx để tích hợp Tutorial

## Thêm import vào đầu file App.jsx:

```jsx
import TutorialIntegration from './TutorialIntegration';
```

## Thêm component vào trong return:

Tìm phần return trong App component và thêm TutorialIntegration section:

```jsx
function App() {
  return (
    <div className="App">
      <header>
        <h1>🎮 Blockchain Gaming Platform</h1>
        {/* ... wallet connection UI ... */}
      </header>

      {/* Gaming Section */}
      <section className="games-section">
        <TaiXiuGame />
        <FishingGame />
      </section>

      {/* Tutorial Integration Section - THÊM PHẦN NÀY */}
      <section className="tutorial-section">
        <TutorialIntegration />
      </section>

      <footer>
        {/* ... footer ... */}
      </footer>
    </div>
  );
}
```

## Hoặc toàn bộ file App.jsx mẫu:

```jsx
import { useState, useEffect } from 'react';
import TaiXiuGame from './TaiXiuGame';
import FishingGame from './FishingGame';
import TutorialIntegration from './TutorialIntegration';
import './index.css';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
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
        }
      } catch (error) {
        console.error('Check connection error:', error);
      }
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Connect wallet error:', error);
    }
  }

  async function disconnectWallet() {
    setAccount('');
    setIsConnected(false);
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎮 Blockchain Gaming Platform</h1>
        <div className="wallet-section">
          {!isConnected ? (
            <button onClick={connectWallet} className="connect-btn">
              🦊 Connect MetaMask
            </button>
          ) : (
            <div className="connected">
              <span className="account-display">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button onClick={disconnectWallet} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* Gaming Section */}
        <section className="games-section">
          <h2>🎲 Gaming Platform</h2>
          <div className="games-grid">
            <TaiXiuGame />
            <FishingGame />
          </div>
        </section>

        {/* Tutorial Integration Section */}
        <section className="tutorial-section">
          <TutorialIntegration />
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 Blockchain Gaming Platform | Built with React + Solidity + Hardhat</p>
      </footer>
    </div>
  );
}

export default App;
```

## CSS Suggestions (thêm vào index.css):

```css
.App {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
}

.app-header {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-header h1 {
  margin: 0;
  color: white;
  font-size: 2rem;
}

.wallet-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.connect-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.connect-btn:hover {
  transform: translateY(-2px);
}

.connected {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.account-display {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-family: monospace;
}

.disconnect-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.app-main {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.games-section {
  margin-bottom: 3rem;
}

.games-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.tutorial-section {
  margin-top: 3rem;
}

.app-footer {
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 4rem;
}
```

Sau khi cập nhật, chạy lại frontend để xem kết quả!
