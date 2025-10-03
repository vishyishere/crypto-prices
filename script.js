// fetch prices from CoinGecko (no API key)
const COINS = [
  {id:'bitcoin', symbol:'BTC', name:'Bitcoin'},
  {id:'ethereum', symbol:'ETH', name:'Ethereum'},
  {id:'tether', symbol:'USDT', name:'Tether'},
  {id:'binancecoin', symbol:'BNB', name:'BNB'},
  {id:'solana', symbol:'SOL', name:'Solana'},
  {id:'dogecoin', symbol:'DOGE', name:'Dogecoin'},
  {id:'matic-network', symbol:'MATIC', name:'Polygon'},
  {id:'chainlink', symbol:'LINK', name:'Chainlink'}
];

const coinsSelect = document.getElementById('coins');
const refreshBtn = document.getElementById('refresh');
const autoBtn = document.getElementById('autoToggle');
const results = document.getElementById('results');

let autoTimer = null;
const AUTO_INTERVAL_MS = 30000;

function populateList(){
  COINS.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.symbol.toUpperCase()})`;
    coinsSelect.appendChild(opt);
  });
  ['bitcoin','ethereum','tether','dogecoin'].forEach(id=>{
    const o = [...coinsSelect.options].find(x=>x.value===id);
    if(o) o.selected = true;
  });
}

async function fetchPrices(ids){
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Network response not ok');
  return res.json();
}

function render(data){
  results.innerHTML = '';
  const ids = Object.keys(data);
  if(ids.length===0){
    results.innerHTML = `<p class="hint">No tokens selected.</p>`;
    return;
  }
  ids.forEach(id=>{
    const coin = COINS.find(c=>c.id===id) || {id, symbol:id, name:id};
    const info = data[id];
    const price = info.usd ?? null;
    const change = info.usd_24h_change ?? 0;

    const card = document.createElement('div'); card.className='card';
    const left = document.createElement('div'); left.className='coin-left';
    left.innerHTML = `
      <div class="logo">${coin.symbol.slice(0,3).toUpperCase()}</div>
      <div class="coin-meta">
        <div class="name">${coin.name}</div>
        <div class="symbol">${coin.symbol.toUpperCase()}</div>
      </div>`;
    const right = document.createElement('div'); right.className='coin-right';
    const changeClass = (change>=0)?'change pos':'change neg';
    right.innerHTML = `
      <div class="price">$${(price!==null)?Number(price).toLocaleString(undefined,{maximumFractionDigits:6}):'—'}</div>
      <div class="${changeClass}">${change>=0?'+':''}${change.toFixed(2)}%</div>`;
    card.appendChild(left); card.appendChild(right); results.appendChild(card);
  });
}

async function refresh(){
  const selected = [...coinsSelect.selectedOptions].map(o=>o.value);
  if(selected.length===0){ results.innerHTML = `<p class="hint">Pick at least one token.</p>`; return; }
  results.innerHTML = `<p class="hint">Loading…</p>`;
  try{ const data = await fetchPrices(selected); render(data); }catch(err){ results.innerHTML = `<p class="hint">Error fetching prices: ${err.message}</p>`; console.error(err); }
}

function toggleAuto(){
  if(autoTimer){ clearInterval(autoTimer); autoTimer=null; autoBtn.textContent='Start Auto (30s)'; autoBtn.style.background=''; }
  else { autoTimer=setInterval(refresh,AUTO_INTERVAL_MS); autoBtn.textContent='Stop Auto'; autoBtn.style.background='linear-gradient(90deg,#204e3e,#186f52)'; refresh(); }
}

populateList(); refreshBtn.addEventListener('click', refresh); autoBtn.addEventListener('click', toggleAuto);
