import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

export default function UpgradePanel({
  walletAddress,
  bomdogCoin = 0,
  clickLevel = 1,
  idleLevel = 1,
  nextClickCost,
  nextIdleCost,
  coinPerClick,
  coinPerHour,
  onSuccess
}) {
  const [loadingType, setLoadingType] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleUpgrade(type) {
    if (!walletAddress) {
      setError('Vui lòng kết nối ví để nâng cấp.')
      return
    }
    setError('')
    setMessage('')
    setLoadingType(type)
    try {
      const response = await fetch(`${API_BASE}/api/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, upgradeType: type })
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Nâng cấp thất bại.')
      }
      setMessage(`Nâng cấp ${type === 'click' ? 'Click' : 'Idle'} thành công!`)
      if (onSuccess) {
        onSuccess(json.data)
      }
    } catch (err) {
      console.error('upgrade error', err)
      setError(err.message || String(err))
    } finally {
      setLoadingType('')
    }
  }

  const disableClick = !walletAddress || loadingType === 'click' || bomdogCoin < (nextClickCost ?? 0)
  const disableIdle = !walletAddress || loadingType === 'idle' || bomdogCoin < (nextIdleCost ?? 0)

  return (
    <section className="rounded-2xl bg-slate-950/80 border border-slate-800/70 shadow-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Nâng cấp kỹ năng</h3>
          <p className="text-[11px] text-slate-400">Dùng Bomdog Coin để tăng thu nhập.</p>
        </div>
        <div className="text-xs text-slate-400 text-right">
          <p>Số dư coin: <span className="text-emerald-300 font-medium">{formatNumber(bomdogCoin)}</span></p>
          <p>Coin / Click: <span className="text-slate-100 font-medium">{coinPerClick?.toFixed ? coinPerClick.toFixed(2) : formatNumber(coinPerClick)}</span></p>
          <p>Coin / Giờ: <span className="text-slate-100 font-medium">{coinPerHour?.toFixed ? coinPerHour.toFixed(2) : formatNumber(coinPerHour)}</span></p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-100">Upgrade Click (Lv {clickLevel})</p>
            <p className="text-[11px] text-slate-400">Tăng điểm nhận được mỗi lần click.</p>
          </div>
          <div className="text-right text-[11px] text-slate-400 mr-2">
            <p>Chi phí: <span className="text-slate-100 font-medium">{formatNumber(nextClickCost ?? 0)}</span></p>
            <p>Còn thiếu: <span className="text-rose-300 font-medium">{formatNumber(Math.max(0, (nextClickCost ?? 0) - bomdogCoin))}</span></p>
          </div>
          <button
            onClick={() => handleUpgrade('click')}
            disabled={disableClick}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingType === 'click' ? 'Đang nâng cấp...' : 'Upgrade'}
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-100">Upgrade Idle (Lv {idleLevel})</p>
            <p className="text-[11px] text-slate-400">Tăng coin nhận được theo thời gian.</p>
          </div>
          <div className="text-right text-[11px] text-slate-400 mr-2">
            <p>Chi phí: <span className="text-slate-100 font-medium">{formatNumber(nextIdleCost ?? 0)}</span></p>
            <p>Còn thiếu: <span className="text-rose-300 font-medium">{formatNumber(Math.max(0, (nextIdleCost ?? 0) - bomdogCoin))}</span></p>
          </div>
          <button
            onClick={() => handleUpgrade('idle')}
            disabled={disableIdle}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingType === 'idle' ? 'Đang nâng cấp...' : 'Upgrade'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  )
}
