import React, { useEffect, useState, useRef } from 'react'

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

  function startGame(){
    if(!account){ alert('Kết nối ví trước khi chơi'); return }
    setMessage(`Xin chào ${shortAddr(account)} — Trò chơi bắt đầu (placeholder)`)
  }

  return (
    <div className="app">
      <header>
        <h1>Web Game Blockchain (React)</h1>
        <p className="desc">Đăng nhập bằng MetaMask để chơi</p>

        <div className="avatar-container">
          <div className="avatar-bubble" title={profile.name || account || 'No account'} onClick={onAvatarClick}>
            {profile.avatar ? <img src={profile.avatar} alt="avatar"/> : (profile.name ? profile.name[0].toUpperCase() : (account? account[2]: '?'))}
          </div>

          {menuOpen && (
            <div className="avatar-menu">
              <div className="menu-row">Tài khoản: <strong>{account? shortAddr(account): '—'}</strong></div>
              <div className="menu-row">
                <label>Họ tên:</label>
                <input value={profile.name || ''} onChange={updateName} placeholder="Tên hiển thị" />
              </div>
              <div className="menu-row">
                <label>Avatar:</label>
                <div className="menu-actions">
                  <button onClick={()=>fileInputRef.current && fileInputRef.current.click()}>Tải ảnh</button>
                  <button onClick={removeAvatar} disabled={!profile.avatar}>Xoá</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFileChange} />
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="card">
        <div className="controls">
          <button onClick={connect}>{hasMeta? 'Kết nối MetaMask':'Không tìm thấy MetaMask'}</button>
          <button onClick={signIn} disabled={!account}>Đăng nhập (ký)</button>
        </div>
        <div className="info">
          <div>Trạng thái: <strong>{status}</strong></div>
          <div>Địa chỉ: <strong>{account? shortAddr(account): '—'}</strong></div>
          <div>Mạng: <strong>{chain || '—'}</strong></div>
        </div>
      </section>

      <section className="card">
        <h2>Giao diện game</h2>
        <button onClick={startGame} disabled={!account}>Bắt đầu trò chơi</button>
        <div className="game-area">{message || 'Trò chơi sẽ hiện ở đây'}</div>
      </section>

      <footer className="foot">Frontend served by Vite. Backend API base: {BASE_URL}</footer>
    </div>
  )
}

export default App
