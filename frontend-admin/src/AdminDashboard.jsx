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
  if (res.status === 401) {
    // try refresh once
    if (!tokens.refresh) throw new Error('Unauthenticated')
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
    // retry original request with new token
    const retryHeaders = {
      ...(options.headers || {}),
      'Content-Type': options.body ? 'application/json' : (options.headers || {})['Content-Type'],
      Authorization: `Bearer ${accessToken}`
    }
    const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders })
    return retryRes
  }
  return res
}

function StatusPill({ status }) {
  const color =
    status === 'active'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
      : 'bg-rose-500/10 text-rose-300 border-rose-500/40'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${color}`}>
      {status}
    </span>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

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
  }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const res = await apiFetch('/api/admin/dashboard', { method: 'GET' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load stats')
      setStats(json.data)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
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
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoadingUsers(false)
    }
  }

  async function openUserDetail(userId) {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, { method: 'GET' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load user')
      setSelectedUser(json.data)
      setEditingUser({
        id: json.data.user._id,
        role: json.data.user.role,
        status: json.data.user.status,
        locked: json.data.user.locked
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
          locked: editingUser.locked
        })
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user')
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              user: { ...prev.user, role: json.data.role, status: json.data.status, locked: json.data.locked }
            }
          : prev
      )
      // reload list to reflect changes
      loadUsers(pagination.page)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  async function performConfirmAction() {
    if (!confirmAction) return
    try {
      if (confirmAction.type === 'ban' || confirmAction.type === 'unban') {
        const res = await apiFetch(`/api/admin/users/${confirmAction.userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: confirmAction.type === 'ban' ? 'banned' : 'active' })
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
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setConfirmAction(null)
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
            <p className="text-xs text-slate-400">Quản lý user & ví blockchain</p>
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

        {/* Stats */}
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Tổng số user</p>
            <p className="mt-1 text-xl font-semibold">
              {loading || !stats ? '...' : stats.totalUsers}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">User online (≈10 phút)</p>
            <p className="mt-1 text-xl font-semibold">
              {loading || !stats ? '...' : stats.onlineUsers}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">User mới hôm nay</p>
            <p className="mt-1 text-xl font-semibold">
              {loading || !stats ? '...' : stats.newUsersToday}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <p className="text-slate-400">Tổng ví đã liên kết</p>
            <p className="mt-1 text-xl font-semibold">
              {loading || !stats ? '...' : stats.linkedWallets}
            </p>
          </div>
        </section>

        {/* User table */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              placeholder="Tìm theo email / username"
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
              <option value="super_admin">super_admin</option>
            </select>
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">active</option>
              <option value="banned">banned</option>
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
                  <th className="px-2 py-1">Email</th>
                  <th className="px-2 py-1">Username</th>
                  <th className="px-2 py-1">Role</th>
                  <th className="px-2 py-1">Trạng thái</th>
                  <th className="px-2 py-1">Ví</th>
                  <th className="px-2 py-1 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-4 text-center text-slate-500">
                      Đang tải danh sách user...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-4 text-center text-slate-500">
                      Không có user
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-800/60">
                      <td className="px-2 py-1">{u.email}</td>
                      <td className="px-2 py-1">{u.username}</td>
                      <td className="px-2 py-1">{u.role}</td>
                      <td className="px-2 py-1">
                        <StatusPill status={u.status} />
                      </td>
                      <td className="px-2 py-1">
                        {u.walletAddress ? `${u.walletAddress.slice(0, 6)}…${u.walletAddress.slice(-4)}` : '—'}
                      </td>
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
                              type: u.status === 'banned' ? 'unban' : 'ban',
                              userId: u._id
                            })
                          }
                          className="rounded-md border border-slate-700 px-2 py-0.5 text-[11px] hover:bg-slate-800"
                        >
                          {u.status === 'banned' ? 'Unban' : 'Ban'}
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
      </main>

      {/* User detail modal */}
      {selectedUser && editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900/95 p-4 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Chi tiết user</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                Đóng
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-slate-400">ID</p>
                <p className="break-all text-slate-200">{selectedUser.user._id}</p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="text-slate-200">{selectedUser.user.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Username</p>
                <p className="text-slate-200">{selectedUser.user.username}</p>
              </div>
              <div>
                <p className="text-slate-400">Wallet</p>
                <p className="text-slate-200">
                  {selectedUser.user.walletAddress ||
                    '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Số game đã chơi</p>
                <p className="text-slate-200">{selectedUser.stats.gamesPlayed}</p>
              </div>
              <div>
                <p className="text-slate-400">Token / Point</p>
                <p className="text-slate-200">{selectedUser.stats.balance}</p>
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
                  <option value="super_admin">super_admin</option>
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
                  <option value="banned">banned</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-1 text-slate-400">
                  <input
                    type="checkbox"
                    checked={editingUser.locked}
                    onChange={(e) =>
                      setEditingUser((prev) => ({ ...prev, locked: e.target.checked }))
                    }
                    className="h-3 w-3"
                  />
                  Locked
                </label>
              </div>
            </div>
            <div className="mb-3">
              <p className="mb-1 text-slate-400">Lịch sử kết nối ví (mới nhất)</p>
              <div className="max-h-32 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/60 p-2">
                {selectedUser.walletHistory.length === 0 ? (
                  <p className="text-slate-500">Chưa có lịch sử.</p>
                ) : (
                  selectedUser.walletHistory.map((w) => (
                    <div key={w._id} className="mb-1 border-b border-slate-800/60 pb-1 last:border-b-0">
                      <div className="text-slate-300">
                        {w.address.slice(0, 6)}…{w.address.slice(-4)} ({w.action})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(w.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
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

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 text-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="mb-3">
              {confirmAction.type === 'delete'
                ? 'Bạn chắc chắn muốn xóa (soft delete) user này?'
                : confirmAction.type === 'ban'
                ? 'Bạn chắc chắn muốn ban user này?'
                : 'Bạn chắc chắn muốn unban user này?'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-md border border-slate-700 px-3 py-1"
              >
                Hủy
              </button>
              <button
                onClick={performConfirmAction}
                className="rounded-md bg-rose-500 px-3 py-1 text-slate-950"
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
