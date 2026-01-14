// Bomdog Clicker Game - client-side only
// Sử dụng MetaMask + ethers.js (CDN) để tương tác smart contract BomdogGame

// TODO: Sau khi chạy script deploy-all, copy giá trị VITE_BOMDOG_CONTRACT từ frontend/.env.deployment
// rồi dán vào đây:
const BOMDOG_CONTRACT_ADDRESS = '0xYourBomdogContractAddressHere';

// Các chainId được phép (có thể chỉnh lại cho phù hợp môi trường của bạn)
// Polygon Amoy testnet = 80002n, bạn có thể thêm chain custom khác nếu dùng
const ALLOWED_CHAIN_IDS = [80002n, 200810n];

// ABI tối giản theo BomdogGame.sol
const BOMDOG_ABI = [
  'function registerPlayer()',
  'function earnClick()',
  'function claimIdle()',
  'function upgradeClick()',
  'function upgradeIdle()',
  'function getPlayer(address player) view returns (uint256 level, uint256 clickPower, uint256 idleIncome, uint256 totalCoins, uint256 lastClaim)'
];

let provider;
let signer;
let contract;
let currentAccount;
let isListeningAccounts = false;
let txPending = false;

// DOM elements
let addressEl,
  coinsEl,
  clickPowerEl,
  idleIncomeEl,
  levelEl,
  connectBtn,
  clickBtn,
  claimIdleBtn,
  upgradeClickBtn,
  upgradeIdleBtn,
  bomdogImg;

function isValidAddress(addr) {
  return typeof addr === 'string' && /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function shortAddress(address) {
  if (!address) return '-';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Khởi tạo game khi DOM đã sẵn sàng
async function initBomdogGame() {
  addressEl = document.getElementById('bomdog-address');
  coinsEl = document.getElementById('bomdog-coins');
  clickPowerEl = document.getElementById('bomdog-click-power');
  idleIncomeEl = document.getElementById('bomdog-idle-income');
  levelEl = document.getElementById('bomdog-level');

  connectBtn = document.getElementById('bomdog-connect');
  clickBtn = document.getElementById('bomdog-click');
  claimIdleBtn = document.getElementById('bomdog-claim-idle');
  upgradeClickBtn = document.getElementById('bomdog-upgrade-click');
  upgradeIdleBtn = document.getElementById('bomdog-upgrade-idle');
  bomdogImg = document.getElementById('bomdog-img');

  if (!connectBtn) {
    // Không tìm thấy container => không chạy
    return;
  }

  connectBtn.addEventListener('click', connectWallet);
  if (clickBtn) clickBtn.addEventListener('click', onClickBomdog);
  if (claimIdleBtn) claimIdleBtn.addEventListener('click', onClaimIdle);
  if (upgradeClickBtn) upgradeClickBtn.addEventListener('click', onUpgradeClick);
  if (upgradeIdleBtn) upgradeIdleBtn.addEventListener('click', onUpgradeIdle);

  if (!window.ethereum) {
    connectBtn.disabled = true;
    connectBtn.textContent = 'MetaMask không có';
    console.warn('MetaMask không được cài đặt.');
  }
}

// Kết nối ví và chuẩn bị contract
async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    if (typeof ethers === 'undefined') throw new Error('ethers.js CDN chưa được load');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    currentAccount = accounts[0];

    if (!isValidAddress(BOMDOG_CONTRACT_ADDRESS)) {
      throw new Error(
        'BOMDOG_CONTRACT_ADDRESS chưa được cấu hình đúng (phải là địa chỉ 0x... của BomdogGame sau khi deploy).'
      );
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    // Kiểm tra mạng nằm trong danh sách cho phép
    if (!ALLOWED_CHAIN_IDS.includes(network.chainId)) {
      console.warn('Đang chạy trên chainId không nằm trong ALLOWED_CHAIN_IDS:', network.chainId);
      alert('Mạng hiện tại không được hỗ trợ cho Bomdog. Vui lòng chọn đúng mạng trong MetaMask.');
    }

    signer = await provider.getSigner();
    contract = new ethers.Contract(BOMDOG_CONTRACT_ADDRESS, BOMDOG_ABI, signer);

    addressEl.textContent = shortAddress(currentAccount);
    connectBtn.textContent = 'Wallet Connected';

    await ensureRegistered();
    await loadPlayerState();

    // Lắng nghe khi user đổi account (chỉ đăng ký một lần)
    if (!isListeningAccounts && window.ethereum && window.ethereum.on) {
      isListeningAccounts = true;
      window.ethereum.on('accountsChanged', async accountsChanged => {
        try {
          if (!accountsChanged || accountsChanged.length === 0) {
            currentAccount = null;
            addressEl.textContent = '-';
            return;
          }
          currentAccount = accountsChanged[0];
          signer = await provider.getSigner();
          contract = new ethers.Contract(BOMDOG_CONTRACT_ADDRESS, BOMDOG_ABI, signer);
          addressEl.textContent = shortAddress(currentAccount);
          await ensureRegistered();
          await loadPlayerState();
        } catch (e) {
          console.error('Lỗi khi xử lý accountsChanged:', e);
        }
      });
    }
  } catch (err) {
    console.error(err);
    alert('Không thể kết nối ví: ' + (err.message || err));
  }
}

// Đảm bảo người chơi đã register trên contract
async function ensureRegistered() {
  const player = await contract.getPlayer(currentAccount);

  const level = Number(player.level ?? player[0]);
  const clickPower = Number(player.clickPower ?? player[1]);
  const idleIncome = Number(player.idleIncome ?? player[2]);
  const totalCoins = Number(player.totalCoins ?? player[3]);
  const lastClaim = Number(player.lastClaim ?? player[4]);

  const isNew =
    level === 0 &&
    clickPower === 0 &&
    idleIncome === 0 &&
    totalCoins === 0 &&
    lastClaim === 0;

  if (isNew) {
    const tx = await contract.registerPlayer();
    await tx.wait();
  }
}

// Load trạng thái người chơi từ contract
async function loadPlayerState() {
  if (!contract || !currentAccount) return;

  const player = await contract.getPlayer(currentAccount);

  const level = Number(player.level ?? player[0]);
  const clickPower = Number(player.clickPower ?? player[1]);
  const idleIncome = Number(player.idleIncome ?? player[2]);
  const totalCoins = Number(player.totalCoins ?? player[3]);

  if (coinsEl) coinsEl.textContent = totalCoins.toString();
  if (clickPowerEl) clickPowerEl.textContent = clickPower.toString();
  if (idleIncomeEl) idleIncomeEl.textContent = idleIncome.toString();
  if (levelEl) levelEl.textContent = level.toString();
}

// Xử lý click Bomdog
async function onClickBomdog() {
  if (!contract || !currentAccount) {
    alert('Vui lòng kết nối ví trước.');
    return;
  }
  if (txPending) return;
  txPending = true;
  if (clickBtn) clickBtn.disabled = true;
  try {
    if (bomdogImg) {
      bomdogImg.classList.add('bomdog-clicking');
      setTimeout(() => bomdogImg.classList.remove('bomdog-clicking'), 150);
    }

    const tx = await contract.earnClick();
    await tx.wait();
    await loadPlayerState();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi click Bomdog: ' + (err.message || err));
  } finally {
    txPending = false;
    if (clickBtn) clickBtn.disabled = false;
  }
}

// Claim coin idle
async function onClaimIdle() {
  if (!contract || !currentAccount) {
    alert('Vui lòng kết nối ví trước.');
    return;
  }
  if (txPending) return;
  txPending = true;
  if (claimIdleBtn) claimIdleBtn.disabled = true;
  try {
    const tx = await contract.claimIdle();
    await tx.wait();
    await loadPlayerState();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi claim idle: ' + (err.message || err));
  } finally {
    txPending = false;
    if (claimIdleBtn) claimIdleBtn.disabled = false;
  }
}

// Nâng cấp click
async function onUpgradeClick() {
  if (!contract || !currentAccount) {
    alert('Vui lòng kết nối ví trước.');
    return;
  }
  if (txPending) return;
  txPending = true;
  if (upgradeClickBtn) upgradeClickBtn.disabled = true;
  try {
    const tx = await contract.upgradeClick();
    await tx.wait();
    await loadPlayerState();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi nâng cấp click: ' + (err.message || err));
  } finally {
    txPending = false;
    if (upgradeClickBtn) upgradeClickBtn.disabled = false;
  }
}

// Nâng cấp idle
async function onUpgradeIdle() {
  if (!contract || !currentAccount) {
    alert('Vui lòng kết nối ví trước.');
    return;
  }
  if (txPending) return;
  txPending = true;
  if (upgradeIdleBtn) upgradeIdleBtn.disabled = true;
  try {
    const tx = await contract.upgradeIdle();
    await tx.wait();
    await loadPlayerState();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi nâng cấp idle: ' + (err.message || err));
  } finally {
    txPending = false;
    if (upgradeIdleBtn) upgradeIdleBtn.disabled = false;
  }
}

// Tự động khởi tạo khi tải trang
window.addEventListener('DOMContentLoaded', initBomdogGame);


