import React, { useEffect, useState, useCallback } from 'react'
import { getBomdogContract, shortAddress } from './utils/blockchain'
import bomdogImg from './bomdog.png'

function emptyPlayer() {
  return {
    level: 0,
    clickPower: 0,
    idleIncome: 0,
    totalCoins: 0,
    lastClaim: 0
  }
}

export default function Bomdog({ account }) {
  const [player, setPlayer] = useState(emptyPlayer)
  const [loading, setLoading] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [error, setError] = useState('')

  const loadPlayer = useCallback(async () => {
    if (!account) {
      setPlayer(emptyPlayer())
      return
    }
    try {
      setLoading(true)
      setError('')
      const contract = await getBomdogContract()
      const data = await contract.getPlayer(account)

      const level = Number(data.level ?? data[0])
      const clickPower = Number(data.clickPower ?? data[1])
      const idleIncome = Number(data.idleIncome ?? data[2])
      const totalCoins = Number(data.totalCoins ?? data[3])
      const lastClaim = Number(data.lastClaim ?? data[4])

      // Nếu chưa đăng ký thì auto register
      if (
        level === 0 &&
        clickPower === 0 &&
        idleIncome === 0 &&
        totalCoins === 0 &&
        lastClaim === 0
      ) {
        const tx = await contract.registerPlayer()
        await tx.wait()
        const fresh = await contract.getPlayer(account)
        setPlayer({
          level: Number(fresh.level ?? fresh[0]),
          clickPower: Number(fresh.clickPower ?? fresh[1]),
          idleIncome: Number(fresh.idleIncome ?? fresh[2]),
          totalCoins: Number(fresh.totalCoins ?? fresh[3]),
          lastClaim: Number(fresh.lastClaim ?? fresh[4])
        })
      } else {
        setPlayer({ level, clickPower, idleIncome, totalCoins, lastClaim })
      }
    } catch (e) {
      console.error(e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => {
    loadPlayer()
  }, [loadPlayer])

  async function runTx(action) {
    if (!account) {
      alert('Vui lòng kết nối ví trước.')
      return
    }
    if (txPending) return
    setTxPending(true)
    setError('')
    try {
      const contract = await getBomdogContract()
      const tx = await action(contract)
      if (tx && tx.wait) {
        await tx.wait()
      }
      await loadPlayer()
    } catch (e) {
      console.error(e)
      setError(e.message || String(e))
    } finally {
      setTxPending(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
      {/* LEFT: Bomdog character card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-slate-800/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
          aria-hidden="true"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/40 blur-3xl" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Bomdog
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                Click to earn on-chain
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end text-xs text-slate-300">
              <span className="text-slate-400">Wallet</span>
              <span>{account ? shortAddress(account) : '—'}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 md:gap-6 py-4">
            <div className="relative group rounded-3xl bg-slate-900/70 border border-slate-700/70 shadow-xl px-8 py-6 w-full max-w-sm">
              <div className="absolute -inset-0.5 rounded-[1.6rem] bg-gradient-to-tr from-amber-400/50 via-sky-400/30 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />

              <div className="relative flex flex-col items-center gap-4">
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-slate-950 flex items-center justify-center shadow-[0_20px_50px_rgba(15,23,42,0.9)]">
                  <img
                    src={bomdogImg}
                    alt="Bomdog"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain select-none transform transition-transform duration-150 group-active:scale-95 group-hover:-translate-y-1 cursor-pointer"
                    onClick={() => runTx(c => c.earnClick())}
                  />
                  <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-slate-900/90 border border-amber-400/60 text-[11px] font-medium text-amber-300 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>+{player.clickPower || 0} / click</span>
                  </div>
                </div>

                <button
                  className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 font-semibold text-sm py-3 shadow-lg shadow-amber-500/40 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => runTx(c => c.earnClick())}
                  disabled={!account || txPending || loading}
                >
                  {txPending ? 'Đang gửi giao dịch...' : 'Click Bomdog'}
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20" />
                    <path d="M5 9l7-7 7 7" />
                  </svg>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Mỗi lần click sẽ gửi transaction và tăng tổng coin của bạn trên smart contract.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-slate-300/90 bg-slate-900/70 border border-slate-800 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className={
                  'inline-block w-2 h-2 rounded-full ' +
                  (txPending ? 'bg-sky-400 animate-pulse' : error ? 'bg-rose-400' : 'bg-emerald-400')
                }
              />
              <span>
                {txPending
                  ? 'Đang xử lý giao dịch…'
                  : error
                  ? 'Có lỗi xảy ra, thử lại sau.'
                  : loading
                  ? 'Đang tải dữ liệu người chơi…'
                  : 'Sẵn sàng.'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: player info + upgrades */}
      <aside className="space-y-4 md:space-y-5">
        <section className="rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-100">Thông tin người chơi</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
              {account ? 'On-chain Player' : 'Guest'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ví:</span>
              <span className="truncate max-w-[180px]">
                {account ? shortAddress(account) : '—'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2.5">
                <p className="text-[11px] text-slate-400">Level</p>
                <p className="mt-0.5 text-base font-semibold text-slate-50">
                  {player.level}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2.5">
                <p className="text-[11px] text-slate-400">Coins</p>
                <p className="mt-0.5 text-base font-semibold text-amber-300">
                  {player.totalCoins}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2.5">
                <p className="text-[11px] text-slate-400">Coin / Click</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-100">
                  {player.clickPower}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2.5">
                <p className="text-[11px] text-slate-400">Coin / Hour</p>
                <p className="mt-0.5 text-sm font-semibold text-emerald-300">
                  {player.idleIncome}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl p-4 md:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Nâng cấp Bomdog</h3>
            <span className="text-[11px] text-slate-500">Tối ưu thu nhập của bạn</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-100">Upgrade Click</p>
                <p className="text-[11px] text-slate-400">
                  Tăng số coin nhận được mỗi lần click.
                </p>
              </div>
              <button
                className="relative inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => runTx(c => c.upgradeClick())}
                disabled={!account || txPending || loading}
              >
                Upgrade
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="13" r="7" />
                  <path d="M12 10v3l2 2" />
                  <path d="M9 3h6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-100">Upgrade Idle</p>
                <p className="text-[11px] text-slate-400">
                  Tăng coin nhận được mỗi giờ, ngay cả khi không click.
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => runTx(c => c.upgradeIdle())}
                disabled={!account || txPending || loading}
              >
                Upgrade
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-1">
            Mỗi nâng cấp đều tốn coin on-chain. Chi tiết chi phí nằm trong smart contract
            BomdogGame.
          </p>

          {error && (
            <div className="mt-2 text-[11px] text-rose-400">
              Lỗi: {error}
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}


