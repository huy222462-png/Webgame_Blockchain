import React, { useEffect, useState } from 'react'

const DEFAULT_BALANCE = 100

function rollDice(){
  return [1 + Math.floor(Math.random()*6), 1 + Math.floor(Math.random()*6), 1 + Math.floor(Math.random()*6)]
}

function sum(arr){ return arr.reduce((s,x)=>s+x,0) }

export default function TaiXiuGame({ account }){
  const storageKey = `taixiuData:${account || 'guest'}`
  const [balance, setBalance] = useState(DEFAULT_BALANCE)
  const [bet, setBet] = useState(10)
  const [side, setSide] = useState('tai') // 'tai' or 'xiu'
  const [dice, setDice] = useState([])
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([])

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(storageKey)
      if(raw){
        const obj = JSON.parse(raw)
        setBalance(obj.balance ?? DEFAULT_BALANCE)
        setHistory(obj.history ?? [])
      }
    }catch(e){ }
  }, [storageKey])

  useEffect(()=>{
    try{ localStorage.setItem(storageKey, JSON.stringify({ balance, history })) }catch(e){}
  }, [storageKey, balance, history])

  function pushHist(entry){
    setHistory(h => [entry, ...h].slice(0,20))
  }

  function placeBet(){
    const b = Number(bet)
    if(isNaN(b) || b <= 0){ setMessage('Số tiền cược không hợp lệ'); return }
    if(b > balance){ setMessage('Không đủ tiền'); return }
    // roll
    const d = rollDice()
    setDice(d)
    const s = sum(d)
    const isTriple = d[0]===d[1] && d[1]===d[2]
    let result = ''
    if(isTriple){
      // house wins on triples
      result = 'house'
    }else if(s >= 11 && s <= 17){
      result = 'tai'
    }else if(s >=4 && s <= 10){
      result = 'xiu'
    }

    if(result === side){
      // win 1:1
      setBalance(prev => prev + b)
      setMessage(`Bạn thắng! ${s} (${d.join('-')}) +${b}`)
      pushHist({ time: Date.now(), dice: d, sum: s, bet: b, side, outcome: 'win' })
    }else{
      setBalance(prev => prev - b)
      setMessage(`Bạn thua. ${s} (${d.join('-')}) -${b}`)
      pushHist({ time: Date.now(), dice: d, sum: s, bet: b, side, outcome: 'lose' })
    }
  }

  function resetGame(){
    setBalance(DEFAULT_BALANCE)
    setHistory([])
    setDice([])
    setMessage('Đã reset')
    try{ localStorage.removeItem(storageKey) }catch(e){}
  }

  return (
    <div className="taixiu-root card">
      <h3>Tài Xỉu (Demo)</h3>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{flex:1}}>
          <div><strong>Số dư:</strong> {balance} xu</div>
          <div style={{marginTop:8}}>
            <label>Đặt cược:</label>
            <input type="number" value={bet} onChange={e=>setBet(e.target.value)} style={{marginLeft:8,width:120}} />
          </div>
          <div style={{marginTop:8}}>
            <label>
              <input type="radio" checked={side==='tai'} onChange={()=>setSide('tai')} /> Tài
            </label>
            <label style={{marginLeft:12}}>
              <input type="radio" checked={side==='xiu'} onChange={()=>setSide('xiu')} /> Xỉu
            </label>
          </div>
          <div style={{marginTop:10}}>
            <button onClick={placeBet}>Lắc (Roll)</button>
            <button onClick={resetGame} style={{marginLeft:8}}>Reset</button>
          </div>
          <div style={{marginTop:8,color:'var(--muted)'}}>Ghi chú: Nếu 3 viên giống nhau (triple) nhà cái thắng.</div>
        </div>

        <div style={{width:320}}>
          <div style={{fontWeight:700}}>Kết quả</div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            {dice.length===0 ? <div style={{color:'var(--muted)'}}>Chưa có lượt</div> : dice.map((d,i)=>(
              <div key={i} style={{width:56,height:56,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.04)',fontSize:20}}>{d}</div>
            ))}
          </div>
          <div style={{marginTop:10}}>{message}</div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div style={{fontWeight:700}}>Lịch sử</div>
        <div style={{maxHeight:160,overflow:'auto',background:'rgba(255,255,255,0.02)',padding:8,borderRadius:6,marginTop:8}}>
          {history.length===0 ? <div style={{color:'var(--muted)'}}>Chưa có lượt</div> : history.map((h,i)=> (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 4px',borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
              <div>{new Date(h.time).toLocaleTimeString()} - {h.dice.join('-')} (sum {h.sum})</div>
              <div style={{color: h.outcome==='win' ? '#9be79b' : '#f28b82'}}>{h.outcome==='win' ? 'Thắng' : 'Thua'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
