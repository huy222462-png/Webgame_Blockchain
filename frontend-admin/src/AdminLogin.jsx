import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Admin login/register page
 * - Đăng nhập bằng email / username + password
 * - Đăng ký admin mới (super_admin đầu tiên hoặc admin thường)
 * - Yêu cầu role: admin | super_admin (backend sẽ kiểm tra qua JWT khi gọi admin API)
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Đăng nhập thất bại');
      }
      const { user, tokens } = json.data;
      // Only allow admin/super_admin into panel
      if (!['admin', 'super_admin'].includes(user.role)) {
        throw new Error('Tài khoản không có quyền admin');
      }
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('admin_access_token', tokens.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      const res = await fetch(`${API_BASE}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Đăng ký thất bại');
      }
      setSuccess(json.message || 'Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      // Tự động chuyển sang form đăng nhập sau 2 giây
      setTimeout(() => {
        setIsRegister(false);
        setEmailOrUsername(email);
        setPassword('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-1">Admin Panel</h1>
        <p className="text-xs text-slate-400 mb-4">
          {isRegister ? 'Đăng ký tài khoản admin mới' : 'Đăng nhập để quản trị user & ví blockchain.'}
        </p>
        
        {error && (
          <div className="mb-3 rounded-md bg-rose-500/10 border border-rose-500/50 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-3 rounded-md bg-green-500/10 border border-green-500/50 px-3 py-2 text-xs text-green-200">
            {success}
          </div>
        )}

        {!isRegister ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">
                Email hoặc Username
              </label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Mật khẩu</label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-sky-500 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
                setSuccess('');
              }}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Đăng ký admin
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Username</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Mật khẩu (tối thiểu 6 ký tự)</label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-green-600 py-2 text-sm font-medium text-slate-50 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
                setSuccess('');
              }}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Quay lại đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
