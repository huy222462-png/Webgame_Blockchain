import React, { useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

export default function ExchangePoints({ walletAddress, points = 0, exchangeRate, onSuccess }) {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const normalizedRate = exchangeRate || { points: 1000, coin: 10 }
  const maxConvertiblePoints = useMemo(() => {
    if (!points || points < normalizedRate.points) return 0
    const batches = Math.floor(points / normalizedRate.points)
    return batches * normalizedRate.points
  }, [points, normalizedRate.points])

  const coinPreview = useMemo(() => {
    const parsed = Number(inputValue)
    if (!Number.isFinite(parsed) || parsed <= 0) return 0
    return (parsed / normalizedRate.points) * normalizedRate.coin
  }, [inputValue, normalizedRate.points, normalizedRate.coin])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!walletAddress) {
      setError('Vui lòng kết nối ví trước.')
      return
    }

    const pointsToExchange = Number(inputValue)
    if (!Number.isFinite(pointsToExchange) || pointsToExchange <= 0) {
      setError('Nhập số điểm hợp lệ để quy đổi.')
      return
    }
    if (pointsToExchange % normalizedRate.points !== 0) {
      setError(`Số điểm phải là bội số của ${normalizedRate.points}.`)
      return
    }
    if (pointsToExchange > points) {
      setError('Điểm quy đổi vượt quá số điểm hiện có.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, pointsToExchange })
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Quy đổi thất bại.')
      }
      setMessage('Quy đổi thành công!')
      setInputValue('')
      if (onSuccess) {
        onSuccess(json.data)
      }
    } catch (err) {
      console.error('exchangePoints error', err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  function fillWithFraction(ratio) {
    if (!ratio || ratio <= 0 || ratio > 1) return
    const calculated = Math.floor(maxConvertiblePoints * ratio)
    const adjusted = Math.floor(calculated / normalizedRate.points) * normalizedRate.points
    setInputValue(adjusted > 0 ? String(adjusted) : '')
  }

  return (
    <section className="rounded-2xl bg-slate-950/80 border border-slate-800/70 shadow-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Quy đổi điểm</h3>
          <p className="text-[11px] text-slate-400">{normalizedRate.points} điểm = {normalizedRate.coin} Bomdog Coin</p>
        </div>
        <div className="text-xs text-slate-400 text-right">
          <p>Điểm khả dụng: <span className="text-amber-300 font-medium">{formatNumber(points)}</span></p>
          <p>Quy đổi tối đa: <span className="text-emerald-300 font-medium">{formatNumber(maxConvertiblePoints)}</span></p>
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step={normalizedRate.points}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={`Nhập số điểm (bội số ${normalizedRate.points})`}
            className="flex-1 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
            disabled={!walletAddress || loading}
          />
          <button
            type="submit"
            disabled={!walletAddress || loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 text-sm font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang quy đổi...' : 'Quy đổi'}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex gap-2">
            <button
              type="button"
              className="px-2 py-1 rounded-full border border-slate-700 hover:border-emerald-400 transition-colors"
              onClick={() => fillWithFraction(0.25)}
              disabled={!walletAddress || loading || maxConvertiblePoints === 0}
            >
              25%
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full border border-slate-700 hover:border-emerald-400 transition-colors"
              onClick={() => fillWithFraction(0.5)}
              disabled={!walletAddress || loading || maxConvertiblePoints === 0}
            >
              50%
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full border border-slate-700 hover:border-emerald-400 transition-colors"
              onClick={() => fillWithFraction(1)}
              disabled={!walletAddress || loading || maxConvertiblePoints === 0}
            >
              Max
            </button>
          </div>
          <p>{coinPreview > 0 ? `Nhận được ~${formatNumber(Math.floor(coinPreview))} coin` : '—'}</p>
        </div>
      </form>

      {error && <p className="text-xs text-rose-400">{error}</p>}
      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  )
}
