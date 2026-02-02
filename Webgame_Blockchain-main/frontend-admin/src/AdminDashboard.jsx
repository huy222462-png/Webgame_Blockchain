import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getTokens() {
  return {
    access: localStorage.getItem('admin_access_token') || '',
    refresh: localStorage.getItem('admin_refresh_token') || ''
  }
}

async function apiFetch(path, options = {}) {
  const tokens = getTokens()
  const headers = {
    ...(options.headers || {}),
    'Content-Type': options.body ? 'application/json' : (options.headers || {})['Content-Type'],
    Authorization: tokens.access ? `Bearer ${tokens.access}` : undefined
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401 && tokens.refresh) {
    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refresh })
    })
    const refreshJson = await refreshRes.json()
    if (!refreshRes.ok || !refreshJson.success) {
      throw new Error('Session expired, please login again')
    }

    const { accessToken, refreshToken } = refreshJson.data.tokens
    localStorage.setItem('admin_access_token', accessToken)
    localStorage.setItem('admin_refresh_token', refreshToken)

    const retryHeaders = {
      ...(options.headers || {}),
      'Content-Type': options.body ? 'application/json' : (options.headers || {})['Content-Type'],
      Authorization: `Bearer ${accessToken}`
    }
    return fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders })
  }

  return res
}

function StatusPill({ status }) {
  const normalized = status === 'ban' ? 'ban' : 'active'
  const color =
    normalized === 'active'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
      : 'bg-rose-500/10 text-rose-300 border-rose-500/40'

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${color}`}>
      {normalized}
    </span>
  )
}

function formatAddress(address) {
  if (!address) return '—'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function formatTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch (err) {
    return '—'
  }
}

function formatNumber(value) {
  if (value === undefined || value === null) return '0'
  try {
    return new Intl.NumberFormat('en-US').format(Number(value))
  } catch (err) {
    return String(value)
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [listStats, setListStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [withdrawRequests, setWithdrawRequests] = useState([])
  const [withdrawPagination, setWithdrawPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [withdrawSummary, setWithdrawSummary] = useState({})
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState('pending')
  const [loadingWithdraws, setLoadingWithdraws] = useState(true)
  const [processingWithdrawId, setProcessingWithdrawId] = useState('')

  const walletSummary = listStats || stats?.wallet || {
    totalUsers: 0,
    onlineUsers: 0,
    connectedWallets: 0,
    totalScore: 0,
    totalPoints: 0,
    totalCoin: 0,
    totalLockedCoin: 0
  }

  useEffect(() => {
    const adminUserRaw = localStorage.getItem('admin_user')
    if (!adminUserRaw) {
      navigate('/login')
      return
    }
    const adminUser = JSON.parse(adminUserRaw)
    if (!['admin', 'super_admin'].includes(adminUser.role)) {
      navigate('/login')
      return
    }
    loadStats()
    loadUsers(1)
    loadWithdrawRequests(1, 'pending')
  }, [])

  async function loadStats() {
    try {
      setLoadingStats(true)
      const res = await apiFetch('/api/admin/dashboard', { method: 'GET' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load stats')
      setStats(json.data)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoadingStats(false)
    }
  }

  async function loadUsers(page = 1) {
    try {
      setLoadingUsers(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pagination.limit))
      if (search) params.set('q', search)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await apiFetch(`/api/admin/users?${params.toString()}`, { method: 'GET' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load users')
      setUsers(json.data)
      setPagination(json.pagination)
      setListStats(json.stats || null)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoadingUsers(false)
    }
  }

  async function loadWithdrawRequests(page = 1, status = withdrawStatusFilter) {
    try {
      setLoadingWithdraws(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(withdrawPagination.limit))
      if (status && status !== 'all') params.set('status', status)

      const res = await apiFetch(`/api/admin/wallet/withdraw-requests?${params.toString()}`, { method: 'GET' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load withdraw requests')
      setWithdrawRequests(json.data.items || [])
      setWithdrawPagination(json.data.pagination || { page, limit: withdrawPagination.limit, total: 0 })
      setWithdrawSummary(json.data.summary || {})
      setWithdrawStatusFilter(status)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoadingWithdraws(false)
    }
  }

  async function openUserDetail(userId) {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, { method: 'GET' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load user')
      setSelectedUser(json.data)
      setEditingUser({
        id: json.data._id,
        role: json.data.role,
        status: json.data.status,
        score: json.data.score
      })
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  async function saveUserChanges() {
    if (!editingUser) return
    try {
      const res = await apiFetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editingUser.role,
          status: editingUser.status,
          score: editingUser.score
        })
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user')
      setSelectedUser(json.data)
      setEditingUser({
        id: json.data._id,
        role: json.data.role,
        status: json.data.status,
        score: json.data.score
      })
      loadUsers(pagination.page)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  async function performConfirmAction() {
    if (!confirmAction) return
    try {
      if (confirmAction.type === 'ban' || confirmAction.type === 'unban') {
        const endpoint = confirmAction.type === 'ban' ? 'ban' : 'unban'
        const res = await apiFetch(`/api/admin/users/${confirmAction.userId}/${endpoint}`, {
          method: 'POST'
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user status')
      } else if (confirmAction.type === 'delete') {
        const res = await apiFetch(`/api/admin/users/${confirmAction.userId}`, {
          method: 'DELETE'
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete user')
      }
      loadUsers(pagination.page)
      setSelectedUser(null)
      setEditingUser(null)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setConfirmAction(null)
    }
  }

  async function handleReviewWithdraw(requestId, approve) {
    if (!requestId) return
    const notePrompt = approve
      ? 'Ghi chú phê duyệt (tuỳ chọn)' 
      : 'Lý do từ chối (bắt buộc)'
    const noteInput = window.prompt(notePrompt, '')
    if (!approve && !noteInput) {
      return
    }

    try {
      setProcessingWithdrawId(requestId)
      const res = await apiFetch(`/api/admin/wallet/withdraw/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve, note: noteInput || null })
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Xử lý rút coin thất bại')
      await loadWithdrawRequests(withdrawPagination.page, withdrawStatusFilter)
      await loadUsers(pagination.page)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setProcessingWithdrawId('')
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('admin_refresh_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Quản lý người chơi ví blockchain</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 space-y-4">
        {error && (
          <div className="rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Ví đã kết nối</p>
            <p className="mt-1 text-xl font-semibold">
              {loadingStats ? '...' : walletSummary.connectedWallets}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Ví online ( 10 phút)</p>
            <p className="mt-1 text-xl font-semibold">
              {loadingStats ? '...' : walletSummary.onlineUsers}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Tổng điểm lưu DB</p>
            <p className="mt-1 text-xl font-semibold text-amber-300">
              {loadingStats ? '...' : (walletSummary.totalPoints ?? walletSummary.totalScore)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Tổng Bomdog Coin</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">
              {loadingStats ? '...' : (walletSummary.totalCoin ?? 0)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Coin bị khoá: <span className="text-slate-300">{loadingStats ? '...' : (walletSummary.totalLockedCoin ?? 0)}</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Legacy users (email)</p>
            <p className="mt-1 text-xl font-semibold">
              {loadingStats || !stats ? '...' : stats.totalUsers}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              placeholder="Tìm theo địa chỉ ví"
              className="min-w-[180px] flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none focus:border-sky-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả role</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">active</option>
              <option value="ban">ban</option>
            </select>
            <button
              onClick={() => loadUsers(1)}
              className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
            >
              Lọc
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-[11px]">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-2 py-1">Ví</th>
                  <th className="px-2 py-1">Điểm</th>
                  <th className="px-2 py-1">Coin</th>
                  <th className="px-2 py-1">Khóa</th>
                  <th className="px-2 py-1">Role</th>
                  <th className="px-2 py-1">Trạng thái</th>
                  <th className="px-2 py-1">Hoạt động</th>
                  <th className="px-2 py-1">Tạo lúc</th>
                  <th className="px-2 py-1 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={9} className="px-2 py-4 text-center text-slate-500">
                      Đang tải danh sách user...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-2 py-4 text-center text-slate-500">
                      Không có user
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-800/60">
                      <td className="px-2 py-1 font-mono">{formatAddress(u.walletAddress)}</td>
                      <td className="px-2 py-1 text-amber-300">{u.score}</td>
                      <td className="px-2 py-1 text-emerald-300">{u.bomdogCoin ?? 0}</td>
                      <td className="px-2 py-1 text-slate-300">{u.lockedBomdogCoin ?? 0}</td>
                      <td className="px-2 py-1">{u.role}</td>
                      <td className="px-2 py-1">
                        <StatusPill status={u.status} />
                      </td>
                      <td className="px-2 py-1">{formatTime(u.lastActive)}</td>
                      <td className="px-2 py-1">{formatTime(u.createdAt)}</td>
                      <td className="px-2 py-1 text-right space-x-1">
                        <button
                          onClick={() => openUserDetail(u._id)}
                          className="rounded-md border border-slate-700 px-2 py-0.5 text-[11px] hover:bg-slate-800"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: u.status === 'ban' ? 'unban' : 'ban',
                              userId: u._id
                            })
                          }
                          className="rounded-md border border-slate-700 px-2 py-0.5 text-[11px] hover:bg-slate-800"
                        >
                          {u.status === 'ban' ? 'Unban' : 'Ban'}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: 'delete',
                              userId: u._id
                            })
                          }
                          className="rounded-md border border-rose-600 px-2 py-0.5 text-[11px] text-rose-300 hover:bg-rose-600/10"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Trang {pagination.page} /{' '}
              {pagination.limit ? Math.max(1, Math.ceil((pagination.total || 0) / pagination.limit)) : 1}
            </span>
            <div className="space-x-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadUsers(pagination.page - 1)}
                className="rounded-md border border-slate-700 px-2 py-0.5 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => loadUsers(pagination.page + 1)}
                className="rounded-md border border-slate-700 px-2 py-0.5 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Yêu cầu rút Bomdog Coin</h3>
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none"
                value={withdrawStatusFilter}
                onChange={(e) => loadWithdrawRequests(1, e.target.value)}
              >
                <option value="pending">Chờ duyệt</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Đã rút</option>
                <option value="failed">Thất bại</option>
                <option value="rejected">Từ chối</option>
                <option value="all">Tất cả</option>
              </select>
              <button
                onClick={() => loadWithdrawRequests(withdrawPagination.page, withdrawStatusFilter)}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
              >
                Làm mới
              </button>
            </div>
          </div>

          <div className="grid gap-2 text-[11px] text-slate-400 sm:grid-cols-3">
            <div>
              Chờ duyệt: <span className="text-slate-200">{formatNumber(withdrawSummary.pending?.count || 0)}</span> yêu cầu —
              <span className="text-amber-300"> {formatNumber(withdrawSummary.pending?.totalAmount || 0)}</span> coin
            </div>
            <div>
              Đang xử lý: <span className="text-slate-200">{formatNumber(withdrawSummary.processing?.count || 0)}</span> —
              <span className="text-emerald-300"> {formatNumber(withdrawSummary.processing?.totalAmount || 0)}</span> coin
            </div>
            <div>
              Đã rút: <span className="text-slate-200">{formatNumber(withdrawSummary.completed?.count || 0)}</span> —
              <span className="text-emerald-300"> {formatNumber(withdrawSummary.completed?.totalAmount || 0)}</span> coin
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-[11px]">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-2 py-1">Ví</th>
                  <th className="px-2 py-1">Số coin</th>
                  <th className="px-2 py-1">Trạng thái</th>
                  <th className="px-2 py-1">Yêu cầu lúc</th>
                  <th className="px-2 py-1">Duyệt lúc</th>
                  <th className="px-2 py-1">Ghi chú</th>
                  <th className="px-2 py-1">Tx Hash</th>
                  <th className="px-2 py-1 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingWithdraws ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-4 text-center text-slate-500">
                      Đang tải danh sách yêu cầu rút...
                    </td>
                  </tr>
                ) : withdrawRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-4 text-center text-slate-500">
                      Không có yêu cầu
                    </td>
                  </tr>
                ) : (
                  withdrawRequests.map((req) => (
                    <tr key={req._id} className="border-b border-slate-800/60">
                      <td className="px-2 py-1 font-mono">{formatAddress(req.walletAddress)}</td>
                      <td className="px-2 py-1 text-emerald-300">{formatNumber(req.amount)}</td>
                      <td className="px-2 py-1 capitalize">{req.status || '—'}</td>
                      <td className="px-2 py-1">{formatTime(req.createdAt)}</td>
                      <td className="px-2 py-1">{formatTime(req.reviewedAt)}</td>
                      <td className="px-2 py-1 text-slate-300">{req.reviewNote || '—'}</td>
                      <td className="px-2 py-1 font-mono text-sky-300">{req.txHash ? `${req.txHash.slice(0, 10)}…` : '—'}</td>
                      <td className="px-2 py-1 text-right space-x-1">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleReviewWithdraw(req._id, true)}
                              disabled={processingWithdrawId === req._id}
                              className="rounded-md border border-emerald-500 px-2 py-0.5 text-[11px] text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
                            >
                              {processingWithdrawId === req._id ? 'Đang xử lý...' : 'Duyệt' }
                            </button>
                            <button
                              onClick={() => handleReviewWithdraw(req._id, false)}
                              disabled={processingWithdrawId === req._id}
                              className="rounded-md border border-rose-500 px-2 py-0.5 text-[11px] text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Trang {withdrawPagination.page} /{' '}
              {withdrawPagination.limit
                ? Math.max(1, Math.ceil((withdrawPagination.total || 0) / withdrawPagination.limit))
                : 1}
            </span>
            <div className="space-x-1">
              <button
                disabled={withdrawPagination.page <= 1}
                onClick={() => loadWithdrawRequests(withdrawPagination.page - 1, withdrawStatusFilter)}
                className="rounded-md border border-slate-700 px-2 py-0.5 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={withdrawPagination.page * withdrawPagination.limit >= withdrawPagination.total}
                onClick={() => loadWithdrawRequests(withdrawPagination.page + 1, withdrawStatusFilter)}
                className="rounded-md border border-slate-700 px-2 py-0.5 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      </main>

      {selectedUser && editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900/95 p-4 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Chi tiết user</h2>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setEditingUser(null)
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                Đóng
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-slate-400">ID</p>
                <p className="break-all text-slate-200">{selectedUser._id}</p>
              </div>
              <div>
                <p className="text-slate-400">Ví</p>
                <p className="text-slate-200">{selectedUser.walletAddress}</p>
              </div>
              <div>
                <p className="text-slate-400">Điểm</p>
                <p className="text-amber-300">{selectedUser.score}</p>
              </div>
              <div>
                <p className="text-slate-400">Bomdog Coin</p>
                <p className="text-emerald-300">{selectedUser.bomdogCoin ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-400">Coin bị khoá</p>
                <p className="text-slate-200">{selectedUser.lockedBomdogCoin ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-400">Hoạt động gần nhất</p>
                <p className="text-slate-200">{formatTime(selectedUser.lastActive)}</p>
              </div>
              <div>
                <p className="text-slate-400">Tạo lúc</p>
                <p className="text-slate-200">{formatTime(selectedUser.createdAt)}</p>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400">Role</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Trạng thái</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">active</option>
                  <option value="ban">ban</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Điểm</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  value={editingUser.score}
                  onChange={(e) => {
                    const next = Number(e.target.value)
                    setEditingUser((prev) => ({
                      ...prev,
                      score: Number.isFinite(next) && next >= 0 ? next : 0
                    }))
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setEditingUser(null)
                }}
                className="rounded-md border border-slate-700 px-3 py-1 text-[11px]"
              >
                Hủy
              </button>
              <button
                onClick={saveUserChanges}
                className="rounded-md bg-sky-500 px-3 py-1 text-[11px] text-slate-950"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/95 p-4 text-xs">
            <p className="text-slate-200">
              {confirmAction.type === 'delete'
                ? 'Xóa user này?'
                : confirmAction.type === 'ban'
                ? 'Ban user này?'
                : 'Gỡ ban user này?'}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-md border border-slate-700 px-3 py-1 text-[11px]"
              >
                Hủy
              </button>
              <button
                onClick={performConfirmAction}
                className="rounded-md bg-rose-500 px-3 py-1 text-[11px] text-slate-950"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
