import React, { useEffect, useState } from 'react'

// Simple demo fishing game
const DEFAULT_BALANCE = 100

const RODS = [
  { id: 'basic', name: 'Cần gỗ', price: 0, power: 1, desc: 'Cần cơ bản' },
  { id: 'iron', name: 'Cần sắt', price: 100, power: 2, desc: 'Tăng tỉ lệ bắt' },
  { id: 'pro', name: 'Cần pro', price: 500, power: 4, desc: 'Dễ bắt cá lớn' }
]

const FISH = [
  { id: 'small', name: 'Cá nhỏ', value: 10, difficulty: 1 },
  { id: 'medium', name: 'Cá trung', value: 50, difficulty: 3 },
  { id: 'big', name: 'Cá lớn', value: 200, difficulty: 8 }
]

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)) }

function pickFish(){
  // weighted pick: small common, medium less, big rare
  const r = Math.random()
  if(r < 0.6) return FISH[0]
  if(r < 0.9) return FISH[1]
  return FISH[2]
}

function computeCatchChance(rodPower, fishDifficulty){
  // simple formula: higher rodPower, easier; higher difficulty harder
  const chance = (rodPower / (fishDifficulty * 2 + 0.1)) * 0.6
  return clamp(chance, 0.02, 0.95)
}

export default function FishingGame({ account }){
  const storageKey = `gameData:${account || 'guest'}`
  const [balance, setBalance] = useState(DEFAULT_BALANCE)
  const [ownedRods, setOwnedRods] = useState(['basic'])
  const [selectedRod, setSelectedRod] = useState('basic')
  const [inventory, setInventory] = useState([])
  const [log, setLog] = useState([])
  const [isCasting, setIsCasting] = useState(false)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(storageKey)
      if(raw){
        const obj = JSON.parse(raw)
        setBalance(obj.balance ?? DEFAULT_BALANCE)
        setOwnedRods(obj.ownedRods ?? ['basic'])
        setInventory(obj.inventory ?? [])
      }
    }catch(e){ console.warn('load game error', e) }
  }, [storageKey])

  useEffect(()=>{
    const obj = { balance, ownedRods, inventory }
    try{ localStorage.setItem(storageKey, JSON.stringify(obj)) }catch(e){ }
  }, [storageKey, balance, ownedRods, inventory])

  function pushLog(text){
    setLog(l => [text, ...l].slice(0,10))
  }

  function buyRod(id){
    const rod = RODS.find(r=>r.id===id)
    if(!rod) return
    if(ownedRods.includes(id)){ pushLog('Bạn đã sở hữu cần này'); return }
    if(balance < rod.price){ pushLog('Không đủ tiền để mua'); return }
    setBalance(b => b - rod.price)
    setOwnedRods(r => [...r, id])
    pushLog(`Mua thành công ${rod.name} (-${rod.price})`)
  }

  async function cast(){
    if(isCasting) return
    setIsCasting(true)
    pushLog('Đang câu...')
    await new Promise(r=>setTimeout(r, 700))
    const rod = RODS.find(r=>r.id===selectedRod)
    const fish = pickFish()
    const chance = computeCatchChance(rod.power, fish.difficulty)
    const roll = Math.random()
    if(roll < chance){
      const caught = { id: fish.id, name: fish.name, value: fish.value, ts: Date.now() }
      setInventory(inv => [caught, ...inv])
      pushLog(`Bắt được ${fish.name} (giá ${fish.value})`)
    }else{
      pushLog('Không bắt được gì lần này')
    }
    setIsCasting(false)
  }

  function sellAll(){
    if(inventory.length===0){ pushLog('Không có cá để bán'); return }
    const total = inventory.reduce((s,f)=>s+f.value, 0)
    setBalance(b => b + total)
    setInventory([])
    pushLog(`Bán tất cả cá: +${total}`)
  }

  return (
    <div className="game-root card">
      <h3>Fishing Demo</h3>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <div style={{flex:'1 1 320px'}}>
          <div><strong>Số dư:</strong> {balance} xu</div>
          <div style={{marginTop:8}}>
            <strong>Cần (sở hữu):</strong>
            <div style={{display:'flex',gap:8,marginTop:6}}>
              {RODS.map(r=> (
                <div key={r.id} style={{border: r.id===selectedRod? '2px solid var(--accent)': '1px solid rgba(255,255,255,0.04)', padding:8, borderRadius:8}}>
                  <div style={{fontWeight:700}}>{r.name}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{r.desc}</div>
                  <div style={{marginTop:6}}>
                    <button onClick={()=>setSelectedRod(r.id)} disabled={!ownedRods.includes(r.id)}>Chọn</button>
                    {!ownedRods.includes(r.id) && <button style={{marginLeft:6}} onClick={()=>buyRod(r.id)}>Mua ({r.price})</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:12}}>
            <button onClick={cast} disabled={isCasting}>Câu cá</button>
            <button onClick={sellAll} style={{marginLeft:8}}>Bán tất cả</button>
          </div>
        </div>

        <div style={{width:320}}>
          <div style={{marginBottom:8}}><strong>Hàng trong túi</strong></div>
          <div style={{maxHeight:220,overflow:'auto',background:'rgba(255,255,255,0.02)',padding:8,borderRadius:6}}>
            {inventory.length===0 ? <div style={{color:'var(--muted)'}}>Chưa có cá</div> : inventory.map((f,i)=> (
              <div key={i} style={{display:'flex',justifyContent:'space-between',Padding:'6px 4px',borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
                <div>{f.name}</div>
                <div>{f.value}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:12}}>
            <div><strong>Nhật ký</strong></div>
            <div style={{maxHeight:120,overflow:'auto',background:'rgba(255,255,255,0.02)',padding:8,borderRadius:6}}>
              {log.length===0 ? <div style={{color:'var(--muted)'}}>Chưa có hành động</div> : log.map((l,i)=> <div key={i} style={{fontSize:13}}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
