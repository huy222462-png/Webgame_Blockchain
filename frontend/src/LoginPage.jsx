import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function LoginPage(){
  const navigate = useNavigate()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      })
      const json = await res.json()
      if(!res.ok || !json.success) throw new Error(json.error || 'Login failed')
      const { user, tokens } = json.data
      // Save tokens for player flows
      if(tokens && tokens.accessToken){
        localStorage.setItem('access_token', tokens.accessToken)
      }
      if(tokens && tokens.refreshToken){
        localStorage.setItem('refresh_token', tokens.refreshToken)
      }
      // Optionally store basic profile
      localStorage.setItem('player_user', JSON.stringify(user))
      navigate('/')
    }catch(err){
      setError(err.message || String(err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-2">Player Login</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="text-xs text-rose-300">{error}</div>}
          <div>
            <label className="text-xs text-slate-300">Email hoặc Username</label>
            <input value={emailOrUsername} onChange={e=>setEmailOrUsername(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" required />
          </div>
          <div>
            <label className="text-xs text-slate-300">Mật khẩu</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" required />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full py-2 rounded-md bg-sky-500 text-slate-900">{loading? 'Đang...' : 'Đăng nhập'}</button>
          </div>
          <div className="text-xs text-slate-400">Chưa có tài khoản? <a href="/register" className="text-sky-300">Đăng ký</a></div>
        </form>
      </div>
    </div>
  )
}
