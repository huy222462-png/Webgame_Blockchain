import React, { useEffect, useState, useRef } from 'react'
import Bomdog from './Bomdog'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function shortAddr(addr){
  if(!addr) return '—'
  return addr.slice(0,6) + '…' + addr.slice(-4)
}

function App(){
  const [hasMeta, setHasMeta] = useState(false)
  const [account, setAccount] = useState(null)
  const [chain, setChain] = useState(null)
  const [status, setStatus] = useState('Chưa kết nối')
  const [message, setMessage] = useState('')

  useEffect(()=>{
    if(window.ethereum){
      setHasMeta(true)
      window.ethereum.on('accountsChanged',(accounts)=>setAccount(accounts[0]||null))
      window.ethereum.on('chainChanged',(c)=>setChain(c))
    }
  },[])
  const [profile, setProfile] = useState({ name:'', avatar:null })
  const fileInputRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
    if(!window.ethereum){
      alert('Vui lòng cài MetaMask')
      return
    }
    try{
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accs[0])
      const c = await window.ethereum.request({ method: 'eth_chainId' })
      setChain(c)
      setStatus('Đã kết nối')
    }catch(err){
      console.error(err)
      setStatus('Kết nối thất bại')
    }
  }

  async function signIn(){
    if(!account){ alert('Kết nối ví trước'); return }
    const msg = `Đăng nhập WebGame: ${new Date().toISOString()}`
    try{
      const sig = await window.ethereum.request({ method: 'personal_sign', params: [msg, account] })
      setMessage('Ký thành công — signature: ' + sig.slice(0,12) + '...')
      setStatus('Đã đăng nhập (ký)')
      // Send to backend for verification
      try{
        const res = await fetch(`${BASE_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ address: account, message: msg, signature: sig })
        })
        const json = await res.json()
        if(res.ok && json.success){
          setMessage(prev => prev + '\nXác thực thành công: ' + json.recovered)
        }else{
          setMessage(prev => prev + '\nXác thực thất bại: ' + (json.error || JSON.stringify(json)))
        }
      }catch(netErr){
        console.error('Verify request failed', netErr)
        setMessage(prev => prev + '\nKhông thể liên hệ backend: ' + (netErr.message || netErr))
      }
    }catch(err){
      console.error(err)
      setMessage('Ký thất bại: ' + (err.message||err))
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
                Mạng: <strong>{chain || '—'}</strong>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-xs text-slate-400">
              <button
                onClick={signIn}
                disabled={!account}
                className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Đăng nhập (ký)
              </button>
              {message && <div className="max-w-xs text-right whitespace-pre-line">{message}</div>}
            </div>
          </section>

          {/* GAME LAYOUT */}
          <Bomdog account={account} />
        </div>
      </main>

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
