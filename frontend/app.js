// app.js - MetaMask connect + minimal game placeholder
const connectBtn = document.getElementById('connectBtn');
const signBtn = document.getElementById('signBtn');
const statusEl = document.getElementById('status');
const addressEl = document.getElementById('address');
const networkEl = document.getElementById('network');
const startGameBtn = document.getElementById('startGameBtn');
const gameArea = document.getElementById('gameArea');

let currentAccount = null;

function shortAddr(addr){
  if(!addr) return '—';
  return addr.slice(0,6) + '…' + addr.slice(-4);
}

function chainName(chainId){
  const mapping = {
    '0x1':'Ethereum Mainnet',
    '0x3':'Ropsten (deprecated)',
    '0x4':'Rinkeby (deprecated)',
    '0x5':'Goerli',
    '0x2a':'Kovan (deprecated)',
    '0x38':'BSC',
    '0x89':'Polygon',
    '0x13881':'Mumbai'
  };
  return mapping[chainId] || chainId;
}

async function connectMetaMask(){
  if(!window.ethereum){
    statusEl.textContent = 'Không tìm thấy MetaMask';
    alert('Vui lòng cài đặt MetaMask hoặc mở trang trong trình duyệt có MetaMask.');
    return;
  }

  try{
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    handleAccountsChanged(accounts);
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    networkEl.textContent = chainName(chainId);
    statusEl.textContent = 'Đã kết nối';
    signBtn.disabled = false;
    startGameBtn.disabled = false;
  }catch(err){
    console.error(err);
    statusEl.textContent = 'Lỗi kết nối';
  }
}

async function handleSignIn(){
  if(!currentAccount){
    alert('Vui lòng kết nối ví trước.');
    return;
  }
  const message = `Đăng nhập Web Game: ${new Date().toISOString()}`;
  try{
    const params = [message, currentAccount];
    const signature = await window.ethereum.request({ method: 'personal_sign', params });
    // You can send (message, signature, address) to backend for verification
    alert('Ký thành công!\nSignature:\n' + signature.slice(0,20) + '...');
    statusEl.textContent = 'Đã đăng nhập (ký)';
  }catch(err){
    console.error('Signing failed', err);
    alert('Ký thất bại: ' + (err.message || err));
  }
}

function handleAccountsChanged(accounts){
  if(!accounts || accounts.length === 0){
    currentAccount = null;
    addressEl.textContent = '—';
    statusEl.textContent = 'Chưa kết nối';
    signBtn.disabled = true;
    startGameBtn.disabled = true;
  } else {
    currentAccount = accounts[0];
    addressEl.textContent = shortAddr(currentAccount);
    statusEl.textContent = 'Đã kết nối';
    signBtn.disabled = false;
    startGameBtn.disabled = false;
  }
}

function handleChainChanged(chainId){
  networkEl.textContent = chainName(chainId);
  // Optional: reload the page on network change
  // window.location.reload();
}

function startGame(){
  if(!currentAccount){
    alert('Vui lòng kết nối MetaMask trước khi bắt đầu.');
    return;
  }
  gameArea.textContent = `Xin chào ${shortAddr(currentAccount)}! Trò chơi bắt đầu — (đây là placeholder)`;
}

connectBtn.addEventListener('click', connectMetaMask);
signBtn.addEventListener('click', handleSignIn);
startGameBtn.addEventListener('click', startGame);

// Listen for account / chain changes
if(window.ethereum){
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
}
