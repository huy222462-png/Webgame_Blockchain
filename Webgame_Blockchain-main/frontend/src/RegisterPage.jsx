import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function RegisterPage(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      })
      const json = await res.json()
      if(!res.ok || !json.success) throw new Error(json.error || 'Register failed')
      const { user, tokens } = json.data
      if(tokens && tokens.accessToken){
        localStorage.setItem('access_token', tokens.accessToken)
      }
      if(tokens && tokens.refreshToken){
        localStorage.setItem('refresh_token', tokens.refreshToken)
      }
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
        <h1 className="text-xl font-semibold mb-2">Player Register</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="text-xs text-rose-300">{error}</div>}
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" required />
          </div>
          <div>
            <label className="text-xs text-slate-300">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" required />
          </div>
          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" required />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full py-2 rounded-md bg-amber-400 text-slate-900">{loading? 'Đang...' : 'Đăng ký'}</button>
          </div>
          <div className="text-xs text-slate-400">Đã có tài khoản? <a href="/login" className="text-sky-300">Đăng nhập</a></div>
        </form>
      </div>
    </div>
  )
}
