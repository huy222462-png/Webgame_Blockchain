import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

export default function WithdrawModal({
  isOpen,
  onClose,
  walletAddress,
  balance = 0,
  minWithdraw = 0,
  onSuccess
}) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setAmount('')
      setError('')
      setTxHash('')
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setTxHash('')

    if (!walletAddress) {
      setError('Vui lòng kết nối ví trước.')
      return
    }

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Nhập số coin hợp lệ để rút.')
      return
    }
    if (parsedAmount < minWithdraw) {
      setError(`Số coin tối thiểu để rút là ${minWithdraw}.`)
      return
    }
    if (parsedAmount > balance) {
      setError('Số coin vượt quá số dư hiện có.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, amount: parsedAmount })
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || 'Rút coin thất bại.')
      }
      setTxHash(json.data?.txHash || '')
      if (onSuccess) {
        onSuccess(json.data)
      }
    } catch (err) {
      console.error('withdraw error', err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Rút Bomdog Coin</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Số dư hiện có: <span className="text-emerald-300 font-semibold">{formatNumber(balance)}</span> coin. Số rút tối thiểu: {formatNumber(minWithdraw)} coin.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="number"
            min={minWithdraw}
            step="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`Nhập số coin muốn rút (>= ${minWithdraw})`}
            className="w-full rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận rút coin'}
          </button>
        </form>

        {error && <p className="text-xs text-rose-400">{error}</p>}
        {txHash && (
          <div className="text-xs text-emerald-300">
            Rút coin thành công! Tx hash:
            <div className="mt-1 break-all font-mono text-[11px] text-slate-200">{txHash}</div>
          </div>
        )}
      </div>
    </div>
  )
}
