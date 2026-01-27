import React, { useEffect, useState, useRef, useCallback } from 'react'
import { verifyMessage } from 'ethers'
import Bomdog from './Bomdog'
import ExchangePoints from './ExchangePoints'
import UpgradePanel from './UpgradePanel'
import WithdrawModal from './WithdrawModal'
import { EXPECTED_NETWORK_LABEL, EXPECTED_CHAIN_HEX, isExpectedChain } from './utils/blockchain'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const REQUIRED_NETWORK_LABEL = EXPECTED_NETWORK_LABEL || 'Đúng mạng'

function shortAddr(addr){
  if(!addr) return '—'
  return addr.slice(0,6) + '…' + addr.slice(-4)
}

function shortenSignature(signature) {
  if (!signature || typeof signature !== 'string') return ''
  if (signature.length <= 16) return signature
  return `${signature.slice(0, 12)}...${signature.slice(-8)}`
}

function App(){
  const [hasMeta, setHasMeta] = useState(false)
  const [account, setAccount] = useState(null)
  const [chain, setChain] = useState(null)
  const [status, setStatus] = useState('Chưa kết nối')
  const [message, setMessage] = useState('')
  const [chainError, setChainError] = useState('')
  const [isSigned, setIsSigned] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [walletProfile, setWalletProfile] = useState(null)
  const [walletSyncError, setWalletSyncError] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const handleChainChanged = useCallback((nextChainId) => {
    setChain(nextChainId)
    if (isExpectedChain(nextChainId)) {
      setChainError('')
    } else {
      setChainError(`Sai mạng blockchain — yêu cầu ${REQUIRED_NETWORK_LABEL}`)
      setIsSigned(false)
      setStatus(prev => (prev === 'Đã đăng nhập (ký)' || prev === 'Đang xác minh chữ ký' ? 'Đã kết nối' : prev))
    }
  }, [])

  const handleAccountsChanged = useCallback((accounts) => {
    const nextAccount = accounts && accounts.length ? accounts[0] : null
    setAccount(nextAccount)
    setIsSigned(false)
    setMessage('')
    setLoginError('')
    if (!nextAccount) {
      setChainError('')
      setWalletProfile(null)
    }
    setStatus(nextAccount ? 'Đã kết nối' : 'Chưa kết nối')
  }, [])

  const syncWalletProfile = useCallback(async (address) => {
    if (!address) {
      setWalletProfile(null)
      return
    }

    try {
      setWalletSyncError('')
      const response = await fetch(`${BASE_URL}/api/wallet/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Không thể đồng bộ ví')
      }

      setWalletProfile(json.data)
    } catch (err) {
      console.error('syncWalletProfile error', err)
      setWalletSyncError(err?.message || String(err))
    }
  }, [])

  useEffect(() => {
    if (!window.ethereum) return;

    setHasMeta(true);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    (async () => {
      try {
        const accs = await window.ethereum.request({ method: 'eth_accounts' });
        handleAccountsChanged(accs);
      } catch (err) {
        console.warn('Không thể lấy danh sách tài khoản', err);
      }
      try {
        const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
        handleChainChanged(currentChain);
      } catch (err) {
        console.warn('Không thể lấy chainId hiện tại', err);
      }
    })();

    return () => {
      try {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      } catch (cleanupErr) {
        console.warn('Không thể gỡ bỏ listener MetaMask', cleanupErr);
      }
    }
  }, [handleAccountsChanged, handleChainChanged]);

  useEffect(() => {
    if (account) {
      syncWalletProfile(account)
    } else {
      setWalletProfile(null)
    }
    setWithdrawOpen(false)
  }, [account, syncWalletProfile])
  const [profile, setProfile] = useState({ name:'', avatar:null })
  const fileInputRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const exchangeRate = walletProfile?.exchangeRate || { points: 1000, coin: 10, pointsPerCoin: 100 }
  const upgradeInfo = walletProfile?.upgrade || {}
  const coinBalance = walletProfile?.bomdogCoin || 0
  const lockedCoin = walletProfile?.lockedBomdogCoin || 0
  const minWithdraw = walletProfile?.config?.minWithdraw || 50

  // load/save profile (name + avatar) per account in localStorage
  useEffect(()=>{
    if(account){
      const key = `userData:${account}`
      const raw = localStorage.getItem(key)
      if(raw){
        try{
          const obj = JSON.parse(raw)
          setProfile(obj)
        }catch(e){
          console.warn('Invalid profile JSON', e)
        }
      }else{
        setProfile({ name: '', avatar: null })
      }
    }else{
      setProfile({ name: '', avatar: null })
    }
  }, [account])

  function saveProfile(newProfile){
    setProfile(newProfile)
    if(account){
      const key = `userData:${account}`
      localStorage.setItem(key, JSON.stringify(newProfile))
    }
  }

  function onAvatarClick(){
    setMenuOpen(open => !open)
  }

  async function onFileChange(e){
    const f = e.target.files && e.target.files[0]
    if(!f) return

    // If backend available and account set, try upload to server for persistent storage
    if(account){
      try{
        const fd = new FormData()
        fd.append('avatar', f)
        const resp = await fetch(`${BASE_URL}/api/avatar/${account}`, {
          method: 'POST',
          body: fd
        })
        const json = await resp.json()
        if(resp.ok && json.success && json.url){
          saveProfile({ ...profile, avatar: json.url })
          return
        }else{
          console.warn('Upload failed, fallback to local', json)
        }
      }catch(err){
        console.warn('Upload failed, fallback to local', err)
      }
    }

    // Fallback: store as data URL in localStorage (works offline, but not cross-device)
    const reader = new FileReader()
    reader.onload = () => {
      saveProfile({ ...profile, avatar: reader.result })
    }
    reader.readAsDataURL(f)
  }

  function removeAvatar(){
    saveProfile({ ...profile, avatar: null })
  }

  function updateName(e){
    saveProfile({ ...profile, name: e.target.value })
  }

  async function connect(){
    setLoginError('')
    setMessage('')
    setChainError('')
    if(!window.ethereum){
      setStatus('MetaMask không khả dụng')
      setMessage('Vui lòng cài đặt MetaMask để tiếp tục.')
      return
    }
    try{
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      handleAccountsChanged(accounts)

      let currentChain = null
      try {
        currentChain = await window.ethereum.request({ method: 'eth_chainId' })
      } catch (chainErr) {
        console.warn('Không thể lấy chainId sau khi kết nối', chainErr)
      }

      if (currentChain && !isExpectedChain(currentChain) && EXPECTED_CHAIN_HEX) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: EXPECTED_CHAIN_HEX }]
          })
          currentChain = await window.ethereum.request({ method: 'eth_chainId' })
        } catch (switchErr) {
          console.warn('Người dùng từ chối hoặc không thể chuyển mạng', switchErr)
          setChainError('Sai mạng blockchain')
        }
      }

      if (currentChain) {
        handleChainChanged(currentChain)
      }

      if (accounts && accounts[0]) {
        await syncWalletProfile(accounts[0])
      }
    }catch(err){
      console.error(err)
      setStatus('Kết nối thất bại')
      setMessage(err?.message || String(err))
    }
  }

  async function signIn(){
    setLoginError('')
    setMessage('')

    if(!account){
      setLoginError('Vui lòng kết nối ví trước khi đăng nhập.')
      return
    }

    const loginMessage = `Đăng nhập WebGame: ${new Date().toISOString()}`

    try{
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [loginMessage, account]
      })

      if(!signature){
        setIsSigned(false)
        setStatus('Đã kết nối')
        setLoginError('Không nhận được chữ ký từ ví.')
        return
      }

      let recoveredAddress = ''
      try {
        recoveredAddress = verifyMessage(loginMessage, signature)
      } catch (verifyErr) {
        console.error('Không thể verify message trên frontend', verifyErr)
        setIsSigned(false)
        setStatus('Đã kết nối')
        setLoginError('Không thể xác minh chữ ký trong trình duyệt.')
        return
      }

      if (!recoveredAddress || recoveredAddress.toLowerCase() !== account.toLowerCase()) {
        setIsSigned(false)
        setStatus('Đã kết nối')
        setLoginError('Chữ ký không khớp với địa chỉ ví đang kết nối.')
        return
      }

      setIsSigned(false)
      setStatus('Đang xác minh chữ ký')
      setMessage(`Ký thành công (${shortenSignature(signature)}). Đang xác minh...`)

      try{
        const response = await fetch(`${BASE_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ address: account, message: loginMessage, signature })
        })
        const json = await response.json()

        if(response.ok && json.success){
          setIsSigned(true)
          setStatus('Đã đăng nhập (ký)')
          setMessage(`Ký thành công (${shortenSignature(signature)}).\nBackend xác thực: ${shortAddr(json.recovered)}`)
          setLoginError('')
        }else{
          const backendError = json.error || 'Backend từ chối chữ ký.'
          setIsSigned(false)
          setStatus('Đã kết nối')
          setMessage('')
          setLoginError(backendError)
        }
      }catch(netErr){
        console.error('Verify request failed', netErr)
        setIsSigned(false)
        setStatus('Đã kết nối')
        setMessage('')
        setLoginError(`Không thể liên hệ backend: ${netErr.message || netErr}`)
      }
    }catch(err){
      console.error(err)
      setIsSigned(false)
      setStatus('Đã kết nối')
      if(err?.code === 4001){
        setLoginError('Bạn đã huỷ ký message.')
      }else{
        setLoginError(err?.message || String(err))
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <svg
                className="w-6 h-6 text-slate-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11V7a3 3 0 0 1 3-3h3" />
                <path d="M20 11V7a3 3 0 0 0-3-3h-3" />
                <rect x="4" y="9" width="16" height="10" rx="4" />
                <path d="M10 15h4" />
                <circle cx="9" cy="13" r="1" />
                <circle cx="15" cy="13" r="1" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-lg">
                  Bomdog Clicker
                </h1>
                <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                  GameFi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                On-chain clicker on Polygon Testnet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Network:</span>
              <span>{chain || '—'}</span>
            </div>
            <button
              onClick={connect}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 shadow-lg shadow-sky-500/30 hover:from-sky-300 hover:to-indigo-400 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!hasMeta}
            >
              <span>{hasMeta ? 'Connect Wallet' : 'MetaMask không có'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8 space-y-4">
          {/* Info bar */}
          <section className="rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-slate-300 space-y-1">
              <div>
                Trạng thái: <strong>{status}</strong>
              </div>
              <div>
                Địa chỉ: <strong>{account ? shortAddr(account) : '—'}</strong>
              </div>
              <div>
                Mạng hiện tại: <strong>{chain || '—'}</strong>
              </div>
              <div>
                Yêu cầu mạng: <strong>{REQUIRED_NETWORK_LABEL}</strong>
              </div>
              <div>
                Điểm tích lũy: <strong>{walletProfile?.points ?? 0}</strong>
              </div>
              {chainError && (
                <div className="text-xs text-rose-400">
                  {chainError}
                </div>
              )}
              {walletSyncError && (
                <div className="text-xs text-rose-400">
                  {walletSyncError}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-xs text-slate-400">
              <button
                onClick={signIn}
                disabled={!account}
                className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSigned ? 'Ký lại' : 'Đăng nhập (ký)'}
              </button>
              {loginError && (
                <div className="max-w-xs text-right text-rose-400 whitespace-pre-line">
                  {loginError}
                </div>
              )}
              {message && (
                <div className="max-w-xs text-right whitespace-pre-line">
                  {message}
                </div>
              )}
            </div>
          </section>

          {/* GAME LAYOUT */}
          <Bomdog
            account={account}
            walletProfile={walletProfile}
            onWalletProfileChange={setWalletProfile}
            walletSyncError={walletSyncError}
          />

          {account && walletProfile && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
              <ExchangePoints
                walletAddress={account}
                points={walletProfile.points || 0}
                exchangeRate={exchangeRate}
                onSuccess={setWalletProfile}
              />

              <div className="space-y-4">
                <UpgradePanel
                  walletAddress={account}
                  bomdogCoin={coinBalance}
                  clickLevel={walletProfile.clickLevel || 1}
                  idleLevel={walletProfile.idleLevel || 1}
                  nextClickCost={upgradeInfo.nextClickCost}
                  nextIdleCost={upgradeInfo.nextIdleCost}
                  coinPerClick={Number(walletProfile.coinPerClick || 0)}
                  coinPerHour={Number(walletProfile.coinPerHour || 0)}
                  onSuccess={setWalletProfile}
                />

                <section className="rounded-2xl bg-slate-950/80 border border-slate-800/70 shadow-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Rút Bomdog Coin</h3>
                      <p className="text-[11px] text-slate-400">Chuyển coin ra on-chain thông qua smart contract.</p>
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      <p>Số dư rảnh: <span className="text-emerald-300 font-medium">{coinBalance.toLocaleString('en-US')}</span></p>
                      <p>Coin khoá: <span className="text-amber-300 font-medium">{lockedCoin.toLocaleString('en-US')}</span></p>
                      <p>Tối thiểu: <span className="text-slate-100 font-medium">{minWithdraw.toLocaleString('en-US')}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWithdrawOpen(true)}
                    disabled={coinBalance < minWithdraw || lockedCoin > 0}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {coinBalance < minWithdraw ? 'Chưa đủ số dư để rút' : lockedCoin > 0 ? 'Đang xử lý giao dịch...' : 'Rút coin on-chain'}
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Hệ thống sẽ khoá coin trong khi giao dịch xử lý để tránh double-withdraw.
                  </p>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        walletAddress={account}
        balance={coinBalance}
        minWithdraw={minWithdraw}
        onSuccess={(data) => {
          setWalletProfile(data)
          setWithdrawOpen(false)
        }}
      />

      {/* FOOTER */}
      <footer className="border-t border-slate-800/70 bg-slate-950/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span>Bomdog Clicker v0.1.0</span>
          <span>Frontend served by Vite — Backend API: {BASE_URL}</span>
        </div>
      </footer>
    </div>
  )
}

export default App
