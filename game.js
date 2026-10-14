/* Nouka Yatra · game logic (7 stops) */
const $ = s => document.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const NS = 'http://www.w3.org/2000/svg';

/* ---------- save ---------- */
let save = {souv:{}, best:{}};
try { save = Object.assign(save, JSON.parse(localStorage.getItem('nouka-yatra') || '{}')); } catch(e) {}
function persist(){ try { localStorage.setItem('nouka-yatra', JSON.stringify(save)); } catch(e) {} }

/* ---------- sound (Web Audio, synthesized) ---------- */
let AC = null, soundOn = true;
function ac(){
  if (!soundOn) return null;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, d, type='sine', v=.2, to=null, delay=0){
  const a = ac(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .05);
}
function noise(d, v=.2, lp=1000, delay=0){
  const a = ac(); if (!a) return;
  const t = a.currentTime + delay, buf = a.createBuffer(1, a.sampleRate*d, a.sampleRate), ch = buf.getChannelData(0);
  for (let i=0;i<ch.length;i++) ch[i] = Math.random()*2-1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = buf; f.type='lowpass'; f.frequency.value = lp;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(f).connect(g).connect(a.destination); s.start(t);
}
const sfx = {
  dhak(delay=0){ tone(120,.28,'sine',.55,45,delay); noise(.1,.25,1400,delay); },
  tak(delay=0){ noise(.06,.3,3500,delay); tone(420,.06,'triangle',.12,null,delay); },
  ding(){ tone(880,.18,'triangle',.18); tone(1320,.25,'triangle',.14,null,.08); },
  tap(){ tone(620,.06,'triangle',.1); },
  buzz(){ tone(150,.28,'square',.08,110); },
  roar(){ tone(95,.7,'sawtooth',.16,48); noise(.6,.18,500); },
  shankh(){ tone(311,1.1,'sawtooth',.05,330); tone(622,1.1,'sine',.04); },
  win(){ [0,.22,.44,.55,.66,.9].forEach((d,i)=> i%2 ? sfx.tak(d) : sfx.dhak(d)); },
  lose(){ tone(300,.4,'triangle',.12,200); tone(220,.6,'triangle',.12,140,.3); },
  bell(delay=0){ tone(1760,.12,'triangle',.05,null,delay); tone(2640,.1,'sine',.025,null,delay); },
  ulu(){
    const a = ac(); if (!a) return;
    const t = a.currentTime, o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain(), g = a.createGain();
    o.frequency.value = 1050; lfo.frequency.value = 11; lg.gain.value = 180;
    lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.07,t+.1); g.gain.setValueAtTime(.07,t+1.1); g.gain.exponentialRampToValueAtTime(.001,t+1.4);
    o.connect(g).connect(a.destination); o.start(t); lfo.start(t); o.stop(t+1.5); lfo.stop(t+1.5);
  }
};

/* ---------- art ---------- */
const INK = '#1d1410';
const SV = {
  roso:`<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="38" rx="18" ry="5" fill="#e9c46a" opacity=".6"/><circle cx="24" cy="25" r="14" fill="#fbf4e2" stroke="${INK}" stroke-width="2.5"/><circle cx="19" cy="20" r="3.5" fill="#fff"/></svg>`,
  sandesh:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 36 Q24 4 41 36 Z" fill="#f2d68f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 13 L14 36 M24 13 L19 36 M24 13 L24 36 M24 13 L29 36 M24 13 L34 36" stroke="#b58a3c" stroke-width="1.5"/><circle cx="24" cy="15" r="2.6" fill="#6fa64a"/></svg>`,
  doi:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 16 L39 16 L33 41 L15 41 Z" fill="#b4532a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="24" cy="16" rx="15" ry="4.5" fill="#d99a52" stroke="${INK}" stroke-width="2.5"/><path d="M13 26 L35 26" stroke="#8a3c1c" stroke-width="2"/></svg>`,
  chom:`<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="26" rx="18" ry="10" fill="#e98aa2" stroke="${INK}" stroke-width="2.5"/><g fill="#fff3d6"><rect x="15" y="21" width="4" height="2" rx="1"/><rect x="24" y="19" width="4" height="2" rx="1"/><rect x="30" y="25" width="4" height="2" rx="1"/><rect x="19" y="27" width="4" height="2" rx="1"/></g></svg>`,
  jilipi:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 25 m-3 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0 a12 12 0 1 1 -24 0" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M24 25 m-3 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0 a12 12 0 1 1 -24 0" fill="none" stroke="#ef9524" stroke-width="4" stroke-linecap="round"/></svg>`,
  haandi:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 20 Q6 42 24 43 Q42 42 38 20 Z" fill="#b4532a" stroke="${INK}" stroke-width="2.5"/><ellipse cx="24" cy="18" rx="12" ry="4" fill="#7a3d1f" stroke="${INK}" stroke-width="2.5"/><circle cx="20" cy="17" r="3" fill="#fbf4e2"/><circle cx="27" cy="17" r="3" fill="#fbf4e2"/><path d="M14 30 Q24 34 34 30" stroke="#efb126" stroke-width="2" fill="none"/></svg>`,
  honeypot:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 18 Q8 42 24 43 Q40 42 36 18 Z" fill="#c98a2b" stroke="${INK}" stroke-width="2.5"/><rect x="11" y="12" width="26" height="7" rx="3" fill="#f6ead0" stroke="${INK}" stroke-width="2.5"/><path d="M18 19 q0 8 3 8 q3 0 3 -8" fill="#efb126" stroke="${INK}" stroke-width="1.5"/></svg>`,
  horse:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 30 L12 42 M18 30 L18 42 M26 30 L26 42 M31 30 L31 42" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M12 30 L12 42 M18 30 L18 42 M26 30 L26 42 M31 30 L31 42" stroke="#b65a2e" stroke-width="2" stroke-linecap="round"/><path d="M9 31 L9 24 Q9 19 15 19 L28 19 L29 8 L27 3 L30 5 L32 2 L33 6 Q38 8 38 13 L33 14 L33 27 Q33 31 29 31 Z" fill="#b65a2e" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="33" cy="9" r="1.3" fill="${INK}"/><path d="M14 23 Q21 28 29 23" stroke="#efb126" stroke-width="1.8" fill="none"/></svg>`,
  sora:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#9c3b22" stroke="${INK}" stroke-width="2.5"/><circle cx="24" cy="24" r="16" fill="none" stroke="#f6ead0" stroke-width="1.4"/><g fill="none" stroke="#f6ead0" stroke-width="1.6">${Array.from({length:8},(_,i)=>`<path d="M24 21 Q20.5 15 24 9.5 Q27.5 15 24 21" transform="rotate(${i*45} 24 24)"/>`).join('')}</g><circle cx="24" cy="24" r="3" fill="#f6ead0"/></svg>`,
  protima:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 46 L7 26 A17 17 0 0 1 41 26 L41 46 Z" fill="#2c4a8a" stroke="${INK}" stroke-width="2"/><path d="M11 46 Q13 36 24 35 Q35 36 37 46 Z" fill="#c8321f" stroke="${INK}" stroke-width="2"/><ellipse cx="24" cy="26" rx="8" ry="10" fill="#f2a93b" stroke="${INK}" stroke-width="2"/><path d="M15 19 L14 10 L19 14 L24 6 L29 14 L34 10 L33 19 Q24 15 15 19 Z" fill="#f4efe2" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M18.5 26 q2.5 -2 5 0 M24.5 26 q2.5 -2 5 0" stroke="${INK}" stroke-width="1.6" fill="none"/><circle cx="24" cy="22" r="1.1" fill="#c8321f"/></svg>`,
  latai:`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="21" y="2" width="6" height="12" rx="2" fill="#9a6a32" stroke="${INK}" stroke-width="2"/><rect x="21" y="34" width="6" height="12" rx="2" fill="#9a6a32" stroke="${INK}" stroke-width="2"/><rect x="11" y="13" width="26" height="22" rx="3" fill="#f6ead0" stroke="${INK}" stroke-width="2.2"/><path d="M11 18 H37 M11 22 H37 M11 26 H37 M11 30 H37" stroke="#d23b22" stroke-width="2"/><path d="M11 13 V35 M37 13 V35" stroke="#9a6a32" stroke-width="3"/></svg>`,
  dhunuchi:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 15 q-4 -6 2 -10 q-2 5 3 7 M27 14 q5 -5 0 -11 q4 3 3 9" stroke="#b9b3c9" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M8 20 Q24 22 40 20 Q36 32 24 33 Q12 32 8 20 Z" fill="#b4532a" stroke="${INK}" stroke-width="2.4"/><ellipse cx="24" cy="20" rx="16" ry="3" fill="#ef8a24" stroke="${INK}" stroke-width="2"/><path d="M21 33 L20 40 L28 40 L27 33" fill="#9a4423" stroke="${INK}" stroke-width="2"/><ellipse cx="24" cy="42" rx="9" ry="3" fill="#b4532a" stroke="${INK}" stroke-width="2"/></svg>`
};
const SWEETS = [
  {id:'roso', bn:'রসগোল্লা', en:'Rosogolla'},
  {id:'sandesh', bn:'সন্দেশ', en:'Sandesh'},
  {id:'doi', bn:'মিষ্টি দই', en:'Mishti doi'},
  {id:'chom', bn:'চমচম', en:'Chomchom'},
  {id:'jilipi', bn:'জিলিপি', en:'Jilipi'}
];
const CUSTS = [
  {bn:'দিদিমা', en:'Didima', cloth:'#f5f0e6', border:'#d23b22', hair:'#d6d0c6', bindi:false},
  {bn:'কাকু', en:'Kaku', cloth:'#4f7cc4', border:'#24356b', hair:INK},
  {bn:'বৌদি', en:'Boudi', cloth:'#d23b22', border:'#efb126', hair:INK, bindi:true},
  {bn:'দাদা', en:'Dada', cloth:'#efb126', border:'#7a3d1f', hair:INK},
  {bn:'মাসি', en:'Mashi', cloth:'#3f8a52', border:'#f6ead0', hair:'#3a2a20', bindi:true},
  {bn:'খোকা', en:'Khoka', cloth:'#8a5cc4', border:'#f6ead0', hair:INK}
];
function avatar(c, mood='ok'){
  const mouth = mood==='happy' ? 'M35 44 Q42 51 49 44' : mood==='sad' ? 'M35 48 Q42 42 49 48' : 'M36 46 L48 46';
  return `<svg viewBox="0 0 84 96" aria-hidden="true">
    <path d="M10 96 Q12 62 42 60 Q72 62 74 96 Z" fill="${c.cloth}" stroke="${INK}" stroke-width="3"/>
    <path d="M18 74 Q42 82 66 74" stroke="${c.border}" stroke-width="5" fill="none"/>
    <circle cx="42" cy="36" r="20" fill="#a86f4a" stroke="${INK}" stroke-width="3"/>
    <path d="M22 34 Q24 12 42 13 Q60 12 62 34 Q54 22 42 22 Q30 22 22 34 Z" fill="${c.hair}" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="35" cy="36" r="2.4" fill="${INK}"/><circle cx="49" cy="36" r="2.4" fill="${INK}"/>
    ${c.bindi ? '<circle cx="42" cy="28" r="2.6" fill="#d23b22"/>' : ''}
    <path d="${mouth}" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

/* ---------- stops ---------- */
const BN_NUM = '০১২৩৪৫৬৭৮৯';
const toBn = n => String(n).split('').map(d => BN_NUM[d] ?? d).join('');
const STOPS = [
  {id:'mishti', bn:'মিষ্টির দোকান', en:'Sweet Shop, Kolkata', play:true, start:startMishti,
   desc:'Customers queue for rosogolla, sandesh and mishti doi. Read each order, then serve it from memory.'},
  {id:'sundarban', bn:'সুন্দরবন', en:'Sundarbans', play:true, start:startSundarban,
   desc:'Collect wild honey in the mangroves. Stay clear of the Royal Bengal Tiger, and pick up Bonbibi\'s lamp for protection.'},
  {id:'bishnupur', bn:'বিষ্ণুপুর', en:'Bishnupur', play:true, start:startBishnupur,
   desc:'A terracotta temple panel has fallen apart. Slide the tiles back into place in as few moves as you can.'},
  {id:'shanti', bn:'শান্তিনিকেতন', en:'Shantiniketan', play:true, start:startShanti,
   desc:'Poush Mela opens soon. Paint three alpona designs on the courtyard floor with rice paste before time runs out.'},
  {id:'kumartuli', bn:'কুমোরটুলি', en:'Kumartuli', play:true, start:startKumartuli,
   desc:'Work with the potters to make a protima: tie the straw frame, smooth on clay, paint it, then paint the eyes.'},
  {id:'ghuddi', bn:'ঘুড়ির লড়াই', en:'Rooftop Kites', play:true, start:startGhuddi,
   desc:'It is Vishwakarma Puja and the sky is full of kites. Tangle strings with rivals and pull hard to cut five of them.'},
  {id:'pujo', bn:'দুর্গাপুজো', en:'Durga Pujo Finale', play:true, start:startPujo,
   desc:'The journey ends at a Kolkata pandal. Dance the dhunuchi naach to the dhak.'}
];
const SOUV = {
  mishti:{bn:'রসগোল্লার হাঁড়ি', en:'A clay haandi of rosogolla', art:'haandi'},
  sundarban:{bn:'বনের মধু', en:'A pot of wild Sundarbans honey', art:'honeypot'},
  bishnupur:{bn:'বাঁকুড়ার ঘোড়া', en:'A terracotta Bankura horse', art:'horse'},
  shanti:{bn:'আলপনা আঁকা সরা', en:'A clay sora painted with alpona', art:'sora'},
  kumartuli:{bn:'ছোট প্রতিমা', en:'A small clay protima', art:'protima'},
  ghuddi:{bn:'লাটাই', en:'A latai, the kite-string reel', art:'latai'},
  pujo:{bn:'ধুনুচি', en:'A clay dhunuchi', art:'dhunuchi'}
};
let selStop = 0;

/* ---------- screens ---------- */
function show(id){
  document.querySelectorAll('.screen').forEach(s => s.hidden = s.id !== id);
}
function stopGames(){
  [SG, SB, BP, AL, KU, KT, DP].forEach(g => { if (g) g.running = false; });
  ACTIVE = null;
  const pb = $('#ktPull'); if (pb) pb.hidden = true;
}
document.querySelectorAll('.backBtn').forEach(b => b.onclick = () => { stopGames(); goMap(); });

$('#soundBtn').onclick = e => {
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? 'শব্দ চালু · Sound on' : 'শব্দ বন্ধ · Sound off';
  e.currentTarget.setAttribute('aria-pressed', soundOn);
};
$('#startBtn').onclick = () => { sfx.shankh(); goMap(); };

/* ---------- map ---------- */
let mapBuilt = false;
function buildMap(){
  const path = $('#riverPath'), L = path.getTotalLength(), g = $('#stopsG');
  // scattered decor: little palms and huts
  const decor = $('#decor'); decor.innerHTML = '';
  [[40,40],[310,90],[50,200],[320,300],[30,420],[310,470],[60,560],[300,600],[150,330],[230,140]].forEach(([x,y],i)=>{
    const el = document.createElementNS(NS,'g');
    el.innerHTML = i%3===0
      ? `<path d="M${x-9} ${y} L${x} ${y-10} L${x+9} ${y} Z" fill="#7a3d1f" stroke="${INK}" stroke-width="1.5"/><rect x="${x-7}" y="${y}" width="14" height="9" fill="#c98a2b" stroke="${INK}" stroke-width="1.5"/>`
      : `<path d="M${x} ${y+10} Q${x+2} ${y} ${x} ${y-8}" stroke="#7a3d1f" stroke-width="2" fill="none"/><path d="M${x} ${y-8} q-10 -2 -13 5 M${x} ${y-8} q10 -2 13 5 M${x} ${y-8} q-4 -9 -10 -9 M${x} ${y-8} q4 -9 10 -9" stroke="#3f8a52" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    decor.appendChild(el);
  });
  g.innerHTML = '';
  STOPS.forEach((s,i) => {
    const p = path.getPointAtLength(L*(0.07 + i*0.85/(STOPS.length-1)));
    s.x = p.x; s.y = p.y;
    const right = p.x < 185;
    const el = document.createElementNS(NS,'g');
    el.setAttribute('class','stop'); el.setAttribute('tabindex','0'); el.setAttribute('role','button');
    const open = s.play && (s.id !== 'pujo' || pujoOpen());
    el.setAttribute('aria-label', `${s.en}${open?'':' (locked)'}`);
    const done = save.souv[s.id];
    const fill = open ? (done ? '#efb126' : '#d23b22') : '#4a4f6e';
    const tx = right ? p.x+26 : p.x-26, anchor = right ? 'start' : 'end';
    el.innerHTML = `<circle class="ring" cx="${p.x}" cy="${p.y}" r="22" fill="none"/>
      <circle class="dot" cx="${p.x}" cy="${p.y}" r="16" fill="${fill}"/>
      <text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="15" font-weight="700" fill="${open?'#f6ead0':'#b9b3c9'}" font-family="Hind Siliguri, sans-serif">${done?'✓':toBn(i+1)}</text>
      <text x="${tx}" y="${p.y-2}" text-anchor="${anchor}" font-size="17" fill="#f6ead0" font-family="Galada, Hind Siliguri, cursive" paint-order="stroke" stroke="#121a33" stroke-width="4">${s.bn}</text>
      <text x="${tx}" y="${p.y+14}" text-anchor="${anchor}" font-size="11" fill="#b9b3c9" font-family="Hind Siliguri, sans-serif" paint-order="stroke" stroke="#121a33" stroke-width="3">${s.en}${open?'':' · locked'}</text>`;
    const choose = () => { selStop = i; sfx.tap(); renderMapSel(); };
    el.addEventListener('click', choose);
    el.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); choose(); }});
    g.appendChild(el);
  });
  mapBuilt = true;
}
function renderMapSel(){
  document.querySelectorAll('.stop').forEach((el,i) => el.classList.toggle('sel', i===selStop));
  const s = STOPS[selStop];
  $('#mapBoat').setAttribute('transform', `translate(${s.x + (s.x<185?-2:2)},${s.y-24})`);
  $('#scBn').textContent = s.bn;
  $('#scEn').textContent = s.en;
  $('#scDesc').textContent = s.desc;
  const chip = $('#scChip');
  const open = s.play && (s.id !== 'pujo' || pujoOpen());
  if (!open) { chip.textContent = 'বন্ধ · Locked'; chip.className = 'chip soon'; $('#scDesc').textContent = `${s.desc} Collect the other six souvenirs to open the finale (${sixCount()}/6).`; }
  else if (save.souv[s.id]) { chip.textContent = 'সংগ্রহ হয়েছে · Collected'; chip.className = 'chip'; }
  else { chip.textContent = 'খেলা যাবে · Open'; chip.className = 'chip'; }
  const b = save.best[s.id];
  $('#scBest').textContent = b != null ? `Best: ${FMT[s.id] ? FMT[s.id](b) : b}` : '';
  $('#playBtn').disabled = !open;
}
function goMap(){
  $('#result').hidden = true;
  show('map');
  buildMap();
  const n = Object.keys(save.souv).length;
  $('#jhuli').textContent = n >= 7 ? 'ঝুলি ভর্তি · Bag full 7/7' : `ঝুলি · Bag ${n}/7`;
  $('#mapTitle').textContent = n >= 7 ? 'যাত্রা সম্পূর্ণ' : 'বাংলার নদীপথ';
  $('#mapSub').textContent = n >= 7 ? 'Journey complete. Replay any stop to beat your best.' : 'River map of Bengal';
  renderMapSel();
}
$('#playBtn').onclick = () => { const s = STOPS[selStop]; if (s.play && !$('#playBtn').disabled) { sfx.dhak(); s.start(); } };

/* ---------- result ---------- */
function showResult({stop, win, title, sub, fact, best}){
  const r = $('#result');
  $('#rKicker').textContent = win ? 'Stop complete' : 'Try again';
  $('#rTitle').textContent = title;
  $('#rSub').textContent = sub;
  const sv = $('#rSouv');
  if (win) {
    const so = SOUV[stop];
    save.souv[stop] = true;
    sv.innerHTML = `${SV[so.art]}<div><b>${so.bn}</b><div class="en">${so.en} is now in your jhuli.</div></div>`;
    sv.hidden = false; sfx.win();
  } else { sv.hidden = true; sfx.lose(); }
  if (best != null) {
    const prev = save.best[stop], low = LOWER_BETTER[stop];
    if (low ? (win && (prev == null || best < prev)) : (prev == null || best > prev)) save.best[stop] = best;
  }
  persist();
  $('#rFact').textContent = fact;
  $('#rRetry').onclick = () => { r.hidden = true; STOPS.find(s=>s.id===stop).start(); };
  $('#rMap').onclick = goMap;
  r.hidden = false;
  $('#rMap').focus();
}

function toast(el, bn, en, ms=1100){
  el.innerHTML = `${bn}${en?`<small>${en}</small>`:''}`;
  el.classList.add('on');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('on'), ms);
}

/* =========================================================
   STOP 1 · MISHTI DOKAN (Sweet Shop)
   ========================================================= */
let SG = null;
const GOAL_SERVE = 6, ROUND = 90;
function startMishti(){
  stopGames(); show('mishti');
  SG = {running:true, time:ROUND, served:0, missed:0, coins:0, cust:null, plate:[], last:performance.now(), peekUntil:0, warned:false};
  const counter = $('#counter'); counter.innerHTML = '';
  SWEETS.forEach(s => {
    const b = document.createElement('button');
    b.className = 'sw'; b.innerHTML = `${SV[s.id]}<span>${s.bn}<br><span class="en">${s.en}</span></span>`;
    b.setAttribute('aria-label', `Add ${s.en}`);
    b.onclick = () => { if (!SG.running || !SG.cust) return; if (SG.plate.length >= 3) { sfx.buzz(); toast($('#mToast'),'থালা ভর্তি!','Plate is full'); return; } SG.plate.push(s.id); sfx.tap(); renderPlate(); };
    counter.appendChild(b);
  });
  renderPlate(); updMHud();
  setTimeout(nextCustomer, 300);
  requestAnimationFrame(mLoop);
}
function renderPlate(){
  const p = $('#plate');
  p.querySelectorAll('button,.empty').forEach(n=>n.remove());
  if (!SG.plate.length) { const e = document.createElement('span'); e.className='empty'; e.textContent='Tap sweets below to add them'; p.prepend(e); return; }
  SG.plate.forEach((id,i) => {
    const b = document.createElement('button'); b.innerHTML = SV[id]; b.setAttribute('aria-label','Remove '+id);
    b.onclick = () => { SG.plate.splice(i,1); sfx.tap(); renderPlate(); };
    p.insertBefore(b, p.querySelector('.lbl'));
  });
}
function nextCustomer(){
  if (!SG.running) return;
  const c = pick(CUSTS);
  const nItems = SG.served < 2 ? (Math.random()<.5?1:2) : SG.served < 4 ? 2 : (Math.random()<.5?2:3);
  const order = Array.from({length:nItems}, () => pick(SWEETS).id);
  const pmax = Math.max(9, 16 - SG.served*1.1);
  SG.cust = {c, order, p:pmax, pmax, memory: SG.served >= 2, showFor: 3.2};
  SG.plate = []; renderPlate();
  const el = $('#cust'); el.classList.remove('away');
  el.innerHTML = `${avatar(c)}<span class="nm">${c.bn} · ${c.en}</span>`;
  $('#say').textContent = pick(['এক থালা দাও! One plate, please:','তাড়াতাড়ি! Quickly please:','আমার জন্য... For me:','দাদা, এগুলো দিন: These, please:']);
  $('#order').innerHTML = order.map(id=>SV[id]).join('') + '<span class="q">মনে আছে? Tap to peek (costs time)</span>';
  $('#order').classList.remove('hide');
  if (SG.cust.memory && !SG.warned) { SG.warned = true; toast($('#mToast'),'এবার মনে রাখো!','Orders now hide after 3 seconds', 2200); }
}
function custLeaves(mood){
  const el = $('#cust');
  el.querySelector('svg').outerHTML = avatar(SG.cust.c, mood);
  SG.cust = null;
  setTimeout(()=> el.classList.add('away'), 350);
  setTimeout(nextCustomer, 900);
}
function peek(){
  if (!SG || !SG.cust || !SG.cust.memory) return;
  if (!$('#order').classList.contains('hide')) return;
  SG.peekUntil = performance.now() + 1300; SG.cust.p -= 2; sfx.tap();
}
$('#bubble').onclick = peek;
$('#bubble').onkeydown = e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); peek(); } };
$('#clearBtn').onclick = () => { if (!SG) return; SG.plate = []; renderPlate(); sfx.tap(); };
$('#serveBtn').onclick = () => {
  if (!SG || !SG.running || !SG.cust) return;
  if (!SG.plate.length) { toast($('#mToast'),'থালা খালি!','The plate is empty'); sfx.buzz(); return; }
  const a = [...SG.plate].sort().join(), b = [...SG.cust.order].sort().join();
  if (a === b) {
    SG.served++; SG.coins += 10 + Math.round(SG.cust.p*2);
    sfx.dhak(); sfx.ding();
    toast($('#mToast'), pick(['দারুণ!','খুব ভালো!','অসাধারণ!']), pick(['Darun! Great!','Khub bhalo! Very good!','Wonderful!']));
    custLeaves('happy'); updMHud();
    if (SG.served >= GOAL_SERVE) endMishti(true);
  } else {
    SG.cust.p -= 3; sfx.buzz();
    toast($('#mToast'),'উঁহু!','That\'s not the order');
    const s = $('#shop'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
  }
};
function updMHud(){
  $('#mTime').textContent = Math.max(0, Math.ceil(SG.time));
  $('#mServed').textContent = `${SG.served}/${GOAL_SERVE}`;
  $('#mCoins').textContent = SG.coins;
}
function mLoop(now){
  if (!SG || !SG.running) return;
  const dt = Math.min(.1, (now - SG.last)/1000); SG.last = now;
  SG.time -= dt;
  const c = SG.cust;
  if (c) {
    c.p -= dt;
    if (c.memory) {
      c.showFor -= dt;
      $('#order').classList.toggle('hide', c.showFor <= 0 && now > SG.peekUntil);
    }
    const f = Math.max(0, c.p / c.pmax), bar = $('#pbar');
    bar.style.width = (f*100)+'%';
    bar.style.background = f < .35 ? 'var(--sindoor)' : f < .6 ? 'var(--haldi)' : 'var(--leaf)';
    if (c.p <= 0) {
      SG.missed++; sfx.buzz();
      toast($('#mToast'),'চলে গেলেন!', `Customer left unhappy (${SG.missed}/3)`);
      custLeaves('sad');
      if (SG.missed >= 3) { endMishti(false, 'Three customers walked out.'); return; }
    }
  }
  updMHud();
  if (SG.time <= 0) { endMishti(SG.served >= GOAL_SERVE, 'The shop closed for the evening.'); return; }
  requestAnimationFrame(mLoop);
}
function endMishti(win, reason=''){
  SG.running = false;
  setTimeout(()=> showResult({
    stop:'mishti', win, best:SG.coins,
    title: win ? 'দোকান জমজমাট!' : 'আজ হল না',
    sub: win ? `You served ${SG.served} customers and earned ₹${SG.coins}.` : `${reason} You served ${SG.served} of ${GOAL_SERVE}. Earned ₹${SG.coins}.`,
    fact: 'West Bengal received a Geographical Indication tag for "Banglar Rasogolla" in 2017. Mishti doi is set in unglazed clay pots called bhaar, which soak up extra moisture and thicken the curd.'
  }), 700);
}

/* =========================================================
   STOP 2 · SUNDARBANS (Honey Collector)
   ========================================================= */
let SB = null;
const HONEY_GOAL = 12;
function startSundarban(){
  stopGames(); show('sundarban');
  const cv = $('#sbCanvas'), ctx = cv.getContext('2d');
  SB = {running:true, honey:0, lives:3, shield:0, inv:0, t:0, keys:{}, target:null, last:performance.now(),
        hives:[], lamp:null, lampT:8, chasing:false, ctx, cv};
  fitSB();
  const {W,H} = SB;
  SB.p = {x:W/2, y:H*.82, r:13, vx:0, vy:0};
  SB.tg = {x:W*.5, y:H*.12, r:18, a:Math.PI/2, rest:2, wt:0};
  // decor as fractions so it survives resize
  SB.trees = Array.from({length:16}, () => ({fx:Math.random(), fy:Math.random(), s:rnd(.7,1.3)}));
  SB.chan = Array.from({length:3}, (_,i) => ({fy:.2+i*.3+rnd(-.05,.05), amp:rnd(.04,.09), ph:rnd(0,6)}));
  SB.roots = Array.from({length:120}, () => ({fx:Math.random(), fy:Math.random()}));
  $('#sHint').style.opacity = 1; setTimeout(()=>{ const h=$('#sHint'); if(h) h.style.opacity=0; }, 3500);
  updSHud();
  requestAnimationFrame(sLoop);
}
function fitSB(){
  if (!SB) return;
  const r = SB.cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  SB.cv.width = Math.max(1, r.width*d); SB.cv.height = Math.max(1, r.height*d);
  SB.ctx.setTransform(d,0,0,d,0,0); SB.W = r.width; SB.H = r.height;
  if (SB.p) { SB.p.x = Math.min(SB.p.x, SB.W-14); SB.p.y = Math.min(SB.p.y, SB.H-14); }
}
window.addEventListener('resize', fitSB);
// input
const cvs = $('#sbCanvas');
function ptr(e){ const r = cvs.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
cvs.addEventListener('pointerdown', e => { if (!SB) return; ac(); cvs.setPointerCapture(e.pointerId); SB.target = ptr(e); });
cvs.addEventListener('pointermove', e => { if (SB && SB.target) SB.target = ptr(e); });
['pointerup','pointercancel'].forEach(t => cvs.addEventListener(t, () => { if (SB) SB.target = null; }));
const KEYMAP = {ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r',W:'u',S:'d',A:'l',D:'r'};
window.addEventListener('keydown', e => { if (SB && SB.running && KEYMAP[e.key]) { SB.keys[KEYMAP[e.key]] = true; e.preventDefault(); }});
window.addEventListener('keyup', e => { if (SB && KEYMAP[e.key]) SB.keys[KEYMAP[e.key]] = false; });

function farSpot(minD){
  for (let i=0;i<30;i++){
    const x = rnd(30, SB.W-30), y = rnd(30, SB.H-30);
    if (Math.hypot(x-SB.tg.x, y-SB.tg.y) > minD && Math.hypot(x-SB.p.x, y-SB.p.y) > 60) return {x,y};
  }
  return {x:rnd(30,SB.W-30), y:rnd(30,SB.H-30)};
}
function updSHud(){
  $('#sHoney').textContent = `${SB.honey}/${HONEY_GOAL}`;
  $('#sLives').textContent = '●'.repeat(SB.lives) + '○'.repeat(3-SB.lives);
  const st = $('#sState');
  if (SB.shield > 0) { st.className='stat shieldOn'; st.innerHTML = `<small>বনবিবি · Bonbibi</small> ${Math.ceil(SB.shield)}s`; }
  else if (SB.chasing) { st.className='stat danger'; st.innerHTML = '<small>বাঘ! · Tiger!</small>'; }
  else { st.className='stat'; st.innerHTML = '<small>শান্ত · Calm</small>'; }
}
function sLoop(now){
  if (!SB || !SB.running) return;
  const dt = Math.min(.05, (now - SB.last)/1000); SB.last = now; SB.t += dt;
  const {W,H,p,tg} = SB;
  // player move
  let dx=0, dy=0;
  if (SB.keys.u) dy--; if (SB.keys.d) dy++; if (SB.keys.l) dx--; if (SB.keys.r) dx++;
  if (!dx && !dy && SB.target) { const tx = SB.target.x-p.x, ty = SB.target.y-p.y, d = Math.hypot(tx,ty); if (d > 6) { dx = tx/d; dy = ty/d; } }
  const m = Math.hypot(dx,dy) || 1, sp = 150;
  p.vx = dx/m*sp; p.vy = dy/m*sp;
  p.x = Math.max(p.r, Math.min(W-p.r, p.x + p.vx*dt));
  p.y = Math.max(p.r, Math.min(H-p.r, p.y + p.vy*dt));
  if (dx||dy) p.walk = (p.walk||0) + dt*10;

  // timers
  SB.shield = Math.max(0, SB.shield - dt); SB.inv = Math.max(0, SB.inv - dt);

  // tiger AI
  const ddx = p.x - tg.x, ddy = p.y - tg.y, dist = Math.hypot(ddx,ddy);
  const tSpeed = Math.min(138, 72 + SB.honey*5.5);
  let wasChasing = SB.chasing; SB.chasing = false;
  if (tg.rest > 0) { tg.rest -= dt; }
  else if (SB.shield > 0) { tg.a = Math.atan2(-ddy,-ddx); move(tg, 115, dt); }
  else if (dist < 190) { SB.chasing = true; tg.a = Math.atan2(ddy,ddx); move(tg, tSpeed, dt); if (!wasChasing) tone(70,.4,'sawtooth',.07,50); }
  else { tg.wt -= dt; if (tg.wt <= 0) { tg.wt = rnd(1.2,2.8); tg.a += rnd(-1.4,1.4); } move(tg, 42, dt); }
  if (tg.x < tg.r || tg.x > W-tg.r || tg.y < tg.r || tg.y > H-tg.r) { tg.a += Math.PI*.7; tg.x = Math.max(tg.r,Math.min(W-tg.r,tg.x)); tg.y = Math.max(tg.r,Math.min(H-tg.r,tg.y)); }
  if (dist < p.r + tg.r - 4 && SB.inv <= 0 && SB.shield <= 0) {
    SB.lives--; SB.inv = 1.8; tg.rest = 1.4; sfx.roar();
    toast($('#sToast'),'বাঘ!','The tiger caught you. Lives left: '+SB.lives, 1300);
    p.x = Math.max(p.r,Math.min(W-p.r, p.x + ddx/(dist||1)*50)); p.y = Math.max(p.r,Math.min(H-p.r, p.y + ddy/(dist||1)*50));
    if (SB.lives <= 0) { endSundarban(false); return; }
  }

  // hives
  while (SB.hives.length < 3) { const s = farSpot(120); SB.hives.push({x:s.x, y:s.y, ph:rnd(0,6)}); }
  SB.hives = SB.hives.filter(h => {
    if (Math.hypot(h.x-p.x, h.y-p.y) < p.r + 14) { SB.honey++; sfx.ding(); toast($('#sToast'),'মধু!', `Honey ${SB.honey}/${HONEY_GOAL}`, 700); return false; }
    return true;
  });
  if (SB.honey >= HONEY_GOAL) { endSundarban(true); return; }

  // Bonbibi lamp
  if (SB.lamp) { SB.lamp.life -= dt; if (SB.lamp.life <= 0) SB.lamp = null;
    else if (Math.hypot(SB.lamp.x-p.x, SB.lamp.y-p.y) < p.r + 14) { SB.lamp = null; SB.shield = 5; sfx.shankh(); toast($('#sToast'),'বনবিবির আশীর্বাদ','Bonbibi protects you for 5 seconds', 1400); } }
  else { SB.lampT -= dt; if (SB.lampT <= 0) { const s = farSpot(80); SB.lamp = {x:s.x, y:s.y, life:7}; SB.lampT = rnd(10,15); } }

  drawSB(); updSHud();
  requestAnimationFrame(sLoop);
}
function move(o, sp, dt){ o.x += Math.cos(o.a)*sp*dt; o.y += Math.sin(o.a)*sp*dt; o.step = (o.step||0)+dt*sp*.08; }

function drawSB(){
  const {ctx,W,H,t,p,tg} = SB;
  // mud ground
  ctx.fillStyle = '#4b5a2c'; ctx.fillRect(0,0,W,H);
  // tidal channels
  SB.chan.forEach(c => {
    ctx.beginPath();
    for (let x=-20; x<=W+20; x+=20) { const y = (c.fy + Math.sin(x/W*6 + c.ph)*c.amp)*H; x===-20 ? ctx.moveTo(x,y) : ctx.lineTo(x,y); }
    ctx.strokeStyle = '#3d6170'; ctx.lineWidth = 34; ctx.lineCap='round'; ctx.stroke();
    ctx.strokeStyle = 'rgba(160,200,215,.25)'; ctx.lineWidth = 2; ctx.setLineDash([10,22]); ctx.lineDashOffset = -t*20; ctx.stroke(); ctx.setLineDash([]);
  });
  // pneumatophores (breathing roots)
  ctx.strokeStyle = '#2e3a1b'; ctx.lineWidth = 2;
  SB.roots.forEach(r => { const x=r.fx*W, y=r.fy*H; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-5); ctx.stroke(); });
  // mangrove canopies
  SB.trees.forEach(tr => {
    const x = tr.fx*W, y = tr.fy*H, s = 22*tr.s;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x+5,y+7,s,s*.7,0,0,7); ctx.fill();
    ctx.fillStyle = '#1f4a26'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    [[0,0,1],[-.6,.2,.7],[.6,.25,.7],[0,-.5,.65]].forEach(([ox,oy,k]) => { ctx.beginPath(); ctx.arc(x+ox*s, y+oy*s, s*k, 0, 7); ctx.fill(); ctx.stroke(); });
    ctx.fillStyle = '#3f8a52'; ctx.beginPath(); ctx.arc(x-s*.25, y-s*.35, s*.28, 0, 7); ctx.fill();
  });
  // hives
  SB.hives.forEach(h => {
    ctx.fillStyle = '#c98a2b'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(h.x, h.y, 11, 15, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#7a4a14'; ctx.lineWidth = 2;
    [-6,0,6].forEach(o => { ctx.beginPath(); ctx.moveTo(h.x-9, h.y+o); ctx.quadraticCurveTo(h.x, h.y+o+3, h.x+9, h.y+o); ctx.stroke(); });
    ctx.fillStyle = '#efb126';
    for (let i=0;i<3;i++){ const a = t*4 + h.ph + i*2.1; ctx.beginPath(); ctx.arc(h.x+Math.cos(a)*20, h.y+Math.sin(a*1.3)*14, 2.2, 0, 7); ctx.fill(); }
  });
  // lamp
  if (SB.lamp) {
    const L = SB.lamp, fl = Math.sin(t*12)*1.5, blink = L.life < 2 && Math.sin(t*20) < 0;
    if (!blink) {
      const g = ctx.createRadialGradient(L.x,L.y-6,2,L.x,L.y-6,36); g.addColorStop(0,'rgba(255,200,80,.6)'); g.addColorStop(1,'rgba(255,200,80,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(L.x,L.y-6,36,0,7); ctx.fill();
      ctx.fillStyle = '#b4532a'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(L.x-12,L.y); ctx.quadraticCurveTo(L.x,L.y+12,L.x+12,L.y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffcf4a'; ctx.beginPath(); ctx.moveTo(L.x+4,L.y-1); ctx.quadraticCurveTo(L.x+fl,L.y-18,L.x+4,L.y-14); ctx.quadraticCurveTo(L.x+8,L.y-6,L.x+4,L.y-1); ctx.fill();
    }
  }
  // tiger
  drawTiger(ctx, tg, t);
  // player
  if (!(SB.inv > 0 && Math.sin(t*30) > 0)) drawPlayer(ctx, p, t);
  // danger vignette
  if (SB.chasing && SB.shield <= 0) {
    const g = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);
    g.addColorStop(0,'rgba(210,59,34,0)'); g.addColorStop(1,`rgba(210,59,34,${.25+Math.sin(t*8)*.08})`);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  }
}
function drawPlayer(ctx, p, t){
  const bob = Math.sin(p.walk||0)*1.5;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x+3,p.y+6,13,8,0,0,7); ctx.fill();
  if (SB.shield > 0) {
    ctx.strokeStyle = `rgba(239,177,38,${.6+Math.sin(t*10)*.3})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(p.x, p.y, 24, 0, 7); ctx.stroke();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
  ctx.fillStyle = '#f6ead0'; ctx.beginPath(); ctx.arc(p.x, p.y+bob*.3, 13, 0, 7); ctx.fill(); ctx.stroke();      // vest
  ctx.strokeStyle = '#d23b22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y+bob*.3, 9.5, 0, 7); ctx.stroke(); // gamchha
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.fillStyle = '#6b4329'; ctx.beginPath(); ctx.arc(p.x, p.y-3+bob*.3, 7, 0, 7); ctx.fill(); ctx.stroke();       // head
  ctx.fillStyle = '#c98a2b'; ctx.beginPath(); ctx.ellipse(p.x+12, p.y+4, 6, 5, 0, 0, 7); ctx.fill(); ctx.stroke(); // honey pot
}
function drawTiger(ctx, tg, t){
  ctx.save(); ctx.translate(tg.x, tg.y); ctx.rotate(tg.a);
  const sw = Math.sin((tg.step||0))*3;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(4,6,28,13,0,0,7); ctx.fill();
  // tail
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-24,0); ctx.quadraticCurveTo(-36, Math.sin(t*5)*10, -44, Math.sin(t*5+1)*12); ctx.stroke();
  ctx.strokeStyle = '#e07a1f'; ctx.lineWidth = 3.5; ctx.stroke();
  // legs
  ctx.fillStyle = '#e07a1f'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  [[14,-11,sw],[14,11,-sw],[-14,-11,-sw],[-14,11,sw]].forEach(([x,y,o]) => { ctx.beginPath(); ctx.ellipse(x+o,y,5,4,0,0,7); ctx.fill(); ctx.stroke(); });
  // body
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0,0,25,12,0,0,7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
  [-14,-6,2,10].forEach(x => { ctx.beginPath(); ctx.moveTo(x,-11); ctx.lineTo(x+3,-3); ctx.moveTo(x,11); ctx.lineTo(x+3,3); ctx.stroke(); });
  // head
  ctx.fillStyle = '#e07a1f'; ctx.beginPath(); ctx.arc(26,0,10,0,7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f6ead0'; ctx.beginPath(); ctx.arc(31,0,5,0,7); ctx.fill();
  ctx.fillStyle = '#e07a1f'; [[21,-9],[21,9]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,3.5,0,7); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = SB.chasing ? '#ffde3a' : INK; [[28,-4],[28,4]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,1.8,0,7); ctx.fill(); });
  ctx.restore();
}
function endSundarban(win){
  SB.running = false;
  setTimeout(()=> showResult({
    stop:'sundarban', win, best:SB.honey,
    title: win ? 'মধু সংগ্রহ সম্পূর্ণ!' : 'বাঘের এলাকা',
    sub: win ? `You gathered all ${HONEY_GOAL} combs and got out of the mangroves safely.` : `The forest got the better of you. You gathered ${SB.honey} of ${HONEY_GOAL} combs.`,
    fact: 'Honey collectors in the Sundarbans are called mouals. Many wore a face mask on the back of the head, because tigers prefer to attack from behind. Before entering the forest they pray to Bonbibi, the forest guardian revered by Hindus and Muslims alike.'
  }), 600);
}

/* =========================================================
   SHARED HELPERS FOR STOPS 3–7
   ========================================================= */
let ACTIVE = null;
window.addEventListener('resize', () => { if (ACTIVE && ACTIVE.running && ACTIVE.resize) ACTIVE.resize(); });
window.addEventListener('keydown', e => { if (ACTIVE && ACTIVE.running && ACTIVE.onKey && ACTIVE.onKey(e)) e.preventDefault(); });
function mkCanvas(cv){
  const o = {cv, ctx:cv.getContext('2d'), W:1, H:1};
  o.fit = () => {
    const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width*d)); cv.height = Math.max(1, Math.round(r.height*d));
    o.ctx.setTransform(d,0,0,d,0,0); o.W = Math.max(1, r.width); o.H = Math.max(1, r.height);
  };
  o.fit(); return o;
}
const relPt = (cv, e) => { const r = cv.getBoundingClientRect(); return {x:e.clientX - r.left, y:e.clientY - r.top}; };
const lerp = (a,b,t) => a + (b-a)*t;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const FMT = {mishti:v=>'₹'+v, sundarban:v=>v+' combs', bishnupur:v=>v+' moves', shanti:v=>v+'/300', kumartuli:v=>v+'/100', ghuddi:v=>v+'s', pujo:v=>v+' pts'};
const LOWER_BETTER = {bishnupur:true, ghuddi:true};
function sixCount(){ return STOPS.filter(s => s.id !== 'pujo' && save.souv[s.id]).length; }
function pujoOpen(){ return sixCount() >= 6; }

/* =========================================================
   STOP 3 · BISHNUPUR (Terracotta sliding puzzle)
   ========================================================= */
let BP = null, PANEL = null;
function makePanel(){
  if (PANEL) return PANEL;
  const S = 450, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d'), dark = '#6a2c12', lite = '#d68a55';
  x.fillStyle = '#b65a2e'; x.fillRect(0,0,S,S);
  for (let i=0;i<3000;i++){ x.fillStyle = Math.random()<.5 ? 'rgba(80,30,10,.2)' : 'rgba(255,205,160,.14)'; x.fillRect(Math.random()*S, Math.random()*S, 2, 2); }
  const relief = draw => { x.save(); x.translate(3,3); x.fillStyle = dark; draw(); x.fill(); x.restore(); x.fillStyle = lite; draw(); x.fill(); x.lineWidth = 2; x.strokeStyle = dark; x.stroke(); };
  const limb = (pts, w) => [[3,dark,w],[0,lite,w-3]].forEach(([o,col,lw]) => {
    x.beginPath(); pts.forEach(([a,b],i) => i ? x.lineTo(a+o,b+o) : x.moveTo(a+o,b+o));
    x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke();
  });
  // bead border
  for (let i=0;i<15;i++){ const p = 15+i*30; [[p,15],[p,S-15],[15,p],[S-15,p]].forEach(([a,b]) => relief(() => { x.beginPath(); x.arc(a,b,9,0,7); })); }
  // lotus frieze
  for (let i=0;i<9;i++){ const cx = 55+i*42.5; relief(() => { x.beginPath(); x.moveTo(cx-17,84); x.quadraticCurveTo(cx-15,52,cx,40); x.quadraticCurveTo(cx+15,52,cx+17,84); x.closePath(); }); }
  // pillars
  [68,382].forEach(cx => { for (let j=0;j<7;j++) relief(() => { x.beginPath(); x.rect(cx-15,100+j*33,30,27); }); });
  // curved Bengal arch
  relief(() => { x.beginPath(); x.moveTo(105,330); x.lineTo(105,175); x.quadraticCurveTo(225,85,345,175); x.lineTo(345,330); x.lineTo(325,330); x.lineTo(325,186); x.quadraticCurveTo(225,113,125,186); x.lineTo(125,330); x.closePath(); });
  // dancer in the niche
  limb([[212,184],[180,170],[170,134]],12); limb([[238,184],[270,170],[282,138]],12);
  relief(() => { x.beginPath(); x.arc(225,152,17,0,7); });
  relief(() => { x.beginPath(); x.moveTo(206,142); x.lineTo(210,124); x.lineTo(218,133); x.lineTo(225,117); x.lineTo(232,133); x.lineTo(240,124); x.lineTo(244,142); x.closePath(); });
  relief(() => { x.beginPath(); x.moveTo(207,176); x.lineTo(243,176); x.lineTo(236,228); x.lineTo(214,228); x.closePath(); });
  relief(() => { x.beginPath(); x.moveTo(214,226); x.lineTo(236,226); x.lineTo(278,300); x.quadraticCurveTo(225,313,172,300); x.closePath(); });
  x.strokeStyle = dark; x.lineWidth = 2; [190,207,225,243,260].forEach(px => { x.beginPath(); x.moveTo(225,232); x.lineTo(px,304); x.stroke(); });
  limb([[212,306],[204,326]],10); limb([[238,306],[250,326]],10);
  // Bankura horses facing each other
  const horse = (hx,hy,f) => {
    x.save(); x.translate(hx,hy); x.scale(f,1);
    [-30,-18,8,18].forEach(lx => relief(() => { x.beginPath(); x.rect(lx,4,8,32); }));
    relief(() => { x.beginPath(); x.moveTo(-36,8); x.lineTo(-36,-10); x.quadraticCurveTo(-32,-20,-16,-20); x.lineTo(8,-20); x.lineTo(12,-58); x.lineTo(8,-68); x.lineTo(16,-62); x.lineTo(20,-72); x.lineTo(23,-60); x.lineTo(38,-50); x.lineTo(36,-41); x.lineTo(24,-43); x.lineTo(24,-8); x.quadraticCurveTo(24,8,8,8); x.closePath(); });
    x.fillStyle = dark; x.beginPath(); x.arc(24,-54,2.5,0,7); x.fill();
    x.strokeStyle = dark; x.lineWidth = 2; x.beginPath(); x.moveTo(-26,-12); x.quadraticCurveTo(-6,-2,14,-12); x.stroke();
    x.restore();
  };
  horse(95,392,1); horse(355,392,-1);
  // lotus rosette
  for (let i=0;i<8;i++){ const a = i*Math.PI/4; relief(() => { x.beginPath(); x.ellipse(225+Math.sin(a)*22, 385-Math.cos(a)*22, 7, 14, a, 0, 7); }); }
  relief(() => { x.beginPath(); x.arc(225,385,10,0,7); });
  PANEL = c.toDataURL('image/png');
  return PANEL;
}
function sizePuzzle(){
  const w = $('#bpWrap'), side = Math.floor(Math.min(w.clientWidth, w.clientHeight, 420));
  const p = $('#puzzle'); p.style.width = p.style.height = Math.max(180, side) + 'px';
}
function bpNeighbors(p){ const r = Math.floor(p/3), c = p%3, o = []; if (r>0) o.push(p-3); if (r<2) o.push(p+3); if (c>0) o.push(p-1); if (c<2) o.push(p+1); return o; }
function bpSolved(){ return BP.board.every((t,i) => t === i); }
function bpPlace(){ BP.board.forEach((t,pos) => { const el = $('#tile'+t); el.style.left = (pos%3)*33.333+'%'; el.style.top = Math.floor(pos/3)*33.333+'%'; }); }
function startBishnupur(){
  stopGames(); show('bishnupur');
  const url = makePanel();
  BP = {running:true, board:[0,1,2,3,4,5,6,7,8], moves:0, t0:performance.now(), solved:false, nums:false};
  ACTIVE = BP; BP.resize = sizePuzzle;
  BP.onKey = e => {
    const dirs = {ArrowLeft:[0,1], ArrowRight:[0,-1], ArrowUp:[1,0], ArrowDown:[-1,0]}, d = dirs[e.key];
    if (!d) return false;
    const ep = BP.board.indexOf(8), r = Math.floor(ep/3)+d[0], c = ep%3+d[1];
    if (r>=0 && r<3 && c>=0 && c<3) bpMove(BP.board[r*3+c]);
    return true;
  };
  let e = 8, prev = -1;
  for (let i=0; i<160 || bpSolved(); i++){ const p = pick(bpNeighbors(e).filter(q => q !== prev)); BP.board[e] = BP.board[p]; BP.board[p] = 8; prev = e; e = p; }
  const pz = $('#puzzle'); pz.innerHTML = ''; pz.classList.remove('nums');
  $('#bpNum').setAttribute('aria-pressed','false');
  for (let id=0; id<9; id++){
    const d = document.createElement('button'); d.className = 'tile'; d.id = 'tile'+id;
    d.style.backgroundImage = `url(${url})`; d.style.backgroundPosition = `${(id%3)*50}% ${Math.floor(id/3)*50}%`;
    d.innerHTML = `<span class="num">${toBn(id+1)}</span>`; d.setAttribute('aria-label', 'Tile '+(id+1));
    if (id === 8) d.hidden = true;
    d.onclick = () => bpMove(id); pz.appendChild(d);
  }
  const pk = document.createElement('div'); pk.className = 'peekImg'; pk.id = 'peekImg'; pk.style.backgroundImage = `url(${url})`; pz.appendChild(pk);
  bpPlace(); sizePuzzle(); $('#bpMoves').textContent = '0';
  requestAnimationFrame(bpLoop);
}
function bpMove(id){
  if (!BP || !BP.running || BP.solved) return;
  const p = BP.board.indexOf(id), e = BP.board.indexOf(8);
  if (!bpNeighbors(e).includes(p)) return;
  BP.board[e] = id; BP.board[p] = 8; BP.moves++; sfx.tak(); bpPlace();
  $('#bpMoves').textContent = BP.moves;
  if (bpSolved()) {
    BP.solved = true; BP.running = false; $('#tile8').hidden = false;
    const secs = Math.round((performance.now()-BP.t0)/1000);
    setTimeout(() => showResult({
      stop:'bishnupur', win:true, best:BP.moves,
      title:'মন্দির আবার সম্পূর্ণ!',
      sub:`You rebuilt the panel in ${BP.moves} moves and ${secs} seconds.`,
      fact:'Bishnupur had little building stone, so its Malla kings built temples of brick and laterite and covered them in fired-clay panels. The Shyam Rai temple (1643) and the twin-roofed Jor Bangla temple show dancers, musicians and scenes from the Ramayana and Mahabharata.'
    }), 800);
  }
}
function bpLoop(){ if (!BP || !BP.running) return; $('#bpTime').textContent = Math.floor((performance.now()-BP.t0)/1000)+'s'; requestAnimationFrame(bpLoop); }
$('#bpPeek').onclick = () => { const p = $('#peekImg'); if (!p) return; p.classList.add('on'); clearTimeout(p._t); p._t = setTimeout(() => p.classList.remove('on'), 1500); };
$('#bpNum').onclick = e => { if (!BP) return; BP.nums = !BP.nums; $('#puzzle').classList.toggle('nums', BP.nums); e.currentTarget.setAttribute('aria-pressed', BP.nums); };

/* =========================================================
   STOP 4 · SHANTINIKETAN (Alpona tracing)
   ========================================================= */
let AL = null;
const UP = -Math.PI/2;
const pol = (r,a) => [Math.cos(a)*r, Math.sin(a)*r];
const circ = (r,n=72) => Array.from({length:n+1}, (_,i) => pol(r, i/n*Math.PI*2));
function qpts(p0,c,p1,n=18){ const o=[]; for (let i=0;i<=n;i++){ const t=i/n, u=1-t; o.push([u*u*p0[0]+2*u*t*c[0]+t*t*p1[0], u*u*p0[1]+2*u*t*c[1]+t*t*p1[1]]); } return o; }
function petalPts(a,r0,r1,w){ const m = (r0+r1)/2*1.18; return [...qpts(pol(r0,a-w), pol(m,a-w*1.1), pol(r1,a)), ...qpts(pol(r1,a), pol(m,a+w*1.1), pol(r0,a+w)).slice(1)]; }
function scal(R,b,n){ const N=n*14, o=[]; for (let i=0;i<=N;i++){ const a=i/N*Math.PI*2; o.push(pol(R + b*Math.abs(Math.sin(a*n/2)), a)); } return o; }
function resamp(pl, step=.014){ const o=[pl[0]]; for (let i=1;i<pl.length;i++){ const [x0,y0]=pl[i-1], [x1,y1]=pl[i], n=Math.max(1, Math.ceil(Math.hypot(x1-x0,y1-y0)/step)); for (let k=1;k<=n;k++) o.push([x0+(x1-x0)*k/n, y0+(y1-y0)*k/n]); } return o; }
const ALPONA = [
  {bn:'চক্র', en:'Chakra, the wheel', time:30,
   lines(){ const L=[circ(.8), circ(.32)]; for (let i=0;i<8;i++){ const a=UP+i*Math.PI/4; L.push([pol(.32,a), pol(.8,a)]); } return L; },
   dots(){ return Array.from({length:8}, (_,i) => pol(.58, UP+Math.PI/8+i*Math.PI/4)); }},
  {bn:'পদ্ম', en:'Padma, the lotus', time:40,
   lines(){ const L=[circ(.2)]; for (let i=0;i<8;i++) L.push(petalPts(UP+i*Math.PI/4,.2,.78,.3)); return L; },
   dots(){ return Array.from({length:8}, (_,i) => pol(.9, UP+i*Math.PI/4)); }},
  {bn:'শঙ্খলতা', en:'Shankha-lata, the conch vine', time:55,
   lines(){ const L=[scal(.78,.12,12), circ(.15)]; for (let i=0;i<6;i++) L.push(petalPts(UP+i*Math.PI/3,.15,.58,.42)); return L; },
   dots(){ return Array.from({length:6}, (_,i) => pol(.67, UP+Math.PI/6+i*Math.PI/3)); }}
];
function startShanti(){
  stopGames(); show('shanti');
  const C = mkCanvas($('#alCanvas'));
  AL = {running:true, C, round:0, total:0, last:performance.now()};
  ACTIVE = AL; AL.resize = () => C.fit();
  alRound(0);
  requestAnimationFrame(alLoop);
}
function alRound(i){
  const P = ALPONA[i];
  Object.assign(AL, {round:i, time:P.time, done:false, strokes:[], cur:null, on:0, spill:0});
  AL.lines = P.lines().map(l => resamp(l));
  AL.guide = AL.lines.flat().map(([x,y]) => ({x, y, h:false}));
  AL.dots = P.dots().map(([x,y]) => ({x, y, h:false}));
  $('#alRound').textContent = `${i+1}/3`;
  toast($('#alToast'), P.bn, P.en, 1600);
}
function alGeo(){ const {W,H} = AL.C; return {cx:W/2, cy:H/2, R:Math.min(W,H)*.44}; }
function alCover(){ const g = AL.guide.filter(p=>p.h).length/AL.guide.length, d = AL.dots.filter(p=>p.h).length/AL.dots.length; return g*.8 + d*.2; }
function alAcc(){ const t = AL.on + AL.spill; return t ? AL.on/t : 1; }
function alInk(nx, ny){
  const c = AL.cur, lp = c[c.length-1], pts = [];
  if (lp) { const d = Math.hypot(nx-lp[0], ny-lp[1]), n = Math.ceil(d/.015); for (let k=1;k<n;k++) pts.push([lp[0]+(nx-lp[0])*k/n, lp[1]+(ny-lp[1])*k/n]); }
  pts.push([nx,ny]);
  pts.forEach(([x,y]) => {
    c.push([x,y]); let md = 9;
    AL.guide.forEach(p => { const d = Math.hypot(p.x-x, p.y-y); if (d < md) md = d; if (d < .06) p.h = true; });
    AL.dots.forEach(p => { const d = Math.hypot(p.x-x, p.y-y); if (d < md) md = d; if (d < .075) p.h = true; });
    if (md < .09) AL.on++; else AL.spill++;
  });
}
const alCv = $('#alCanvas');
function alPtr(e){ const p = relPt(alCv, e), g = alGeo(); alInk((p.x-g.cx)/g.R, (p.y-g.cy)/g.R); }
alCv.addEventListener('pointerdown', e => { if (!AL || !AL.running || AL.done) return; ac(); alCv.setPointerCapture(e.pointerId); AL.cur = []; AL.strokes.push(AL.cur); alPtr(e); });
alCv.addEventListener('pointermove', e => { if (AL && AL.cur && AL.running && !AL.done) alPtr(e); });
['pointerup','pointercancel'].forEach(t => alCv.addEventListener(t, () => { if (AL) AL.cur = null; }));
$('#alWipe').onclick = () => { if (!AL || !AL.running || AL.done) return; AL.strokes = []; AL.cur = null; AL.guide.forEach(p => p.h = false); AL.dots.forEach(p => p.h = false); AL.on = 0; AL.spill = 0; sfx.tap(); };
function alLoop(now){
  if (!AL || !AL.running) return;
  const dt = Math.min(.1, (now-AL.last)/1000); AL.last = now;
  if (!AL.done) {
    AL.time -= dt;
    const cov = alCover();
    if (cov >= .85) {
      AL.done = true; AL.cur = null;
      const sc = Math.round(cov*60 + alAcc()*40); AL.total += sc;
      sfx.dhak(); sfx.ding();
      toast($('#alToast'), pick(['সুন্দর!','অপূর্ব!','বাহ!']), `Design score ${sc}/100`, 1400);
      setTimeout(() => { if (!AL.running) return; if (AL.round < 2) alRound(AL.round+1); else endShanti(true); }, 1500);
    } else if (AL.time <= 0) { AL.done = true; endShanti(false); }
  }
  $('#alTime').textContent = Math.max(0, Math.ceil(AL.time))+'s';
  $('#alCov').textContent = Math.round(alCover()*100)+'%';
  drawAL(now/1000);
  if (AL.running) requestAnimationFrame(alLoop);
}
function drawAL(){
  const {ctx,W,H} = AL.C, {cx,cy,R} = alGeo();
  ctx.fillStyle = '#8a3520'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = 'rgba(0,0,0,.08)';
  for (let i=0;i<60;i++){ const a = i*2.39996, r = Math.sqrt(i/60)*Math.max(W,H)*.7; ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*r, H/2+Math.sin(a)*r, 18+(i%5)*6, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#9a3e24'; ctx.beginPath(); ctx.arc(cx,cy,R*1.06,0,7); ctx.fill();
  // guide
  ctx.strokeStyle = 'rgba(246,234,208,.4)'; ctx.lineWidth = 2.5; ctx.setLineDash([5,7]); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  AL.lines.forEach(l => { ctx.beginPath(); l.forEach(([x,y],i) => i ? ctx.lineTo(cx+x*R, cy+y*R) : ctx.moveTo(cx+x*R, cy+y*R)); ctx.stroke(); });
  ctx.setLineDash([]);
  AL.dots.forEach(d => { ctx.beginPath(); ctx.arc(cx+d.x*R, cy+d.y*R, R*.035, 0, 7); ctx.strokeStyle = 'rgba(246,234,208,.5)'; ctx.lineWidth = 2; ctx.stroke(); });
  // rice paste strokes
  const lw = Math.max(5, R*.05);
  [[1.5,'rgba(60,15,5,.45)'],[0,'#fbf3e0']].forEach(([o,col]) => {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    AL.strokes.forEach(s => {
      if (!s.length) return;
      if (s.length === 1) { ctx.beginPath(); ctx.arc(cx+s[0][0]*R+o, cy+s[0][1]*R+o, lw*.8, 0, 7); ctx.fill(); return; }
      ctx.beginPath(); s.forEach(([x,y],i) => i ? ctx.lineTo(cx+x*R+o, cy+y*R+o) : ctx.moveTo(cx+x*R+o, cy+y*R+o)); ctx.stroke();
    });
  });
  // time ring
  const f = Math.max(0, AL.time/ALPONA[AL.round].time);
  ctx.strokeStyle = f < .3 ? '#efb126' : 'rgba(246,234,208,.28)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, R*1.1, UP, UP + f*Math.PI*2); ctx.stroke();
}
function endShanti(win){
  AL.running = false;
  setTimeout(() => showResult({
    stop:'shanti', win, best:AL.total,
    title: win ? 'আলপনা সম্পূর্ণ!' : 'সময় শেষ',
    sub: win ? `All three designs are on the courtyard floor. Total score ${AL.total}/300.` : `Time ran out on the ${ALPONA[AL.round].en} design. Trace at least 85% of each pattern in time.`,
    fact:'Alpona is drawn on floors with a paste of soaked, ground rice, using a twist of cloth or the fingertips. Rabindranath Tagore encouraged it at Shantiniketan, it became part of the art teaching at Kala Bhavana, and the grounds are decorated with it for Poush Mela every winter.'
  }), 900);
}

/* =========================================================
   STOP 5 · KUMARTULI (Idol making)
   ========================================================= */
let KU = null;
const HCTX = document.createElement('canvas').getContext('2d');
const KPATH = (() => {
  const halo = new Path2D(); halo.moveTo(-125,325); halo.lineTo(-125,135); halo.arc(0,135,125,Math.PI,0); halo.lineTo(125,325); halo.closePath();
  const torso = new Path2D(); torso.moveTo(-22,178); torso.quadraticCurveTo(-85,186,-100,215); torso.lineTo(-112,325); torso.lineTo(112,325); torso.lineTo(100,215); torso.quadraticCurveTo(85,186,22,178); torso.closePath();
  const face = new Path2D(); face.ellipse(0,112,44,54,0,0,Math.PI*2); face.rect(-15,150,30,34);
  const crown = new Path2D(); crown.moveTo(-56,82);
  [[-62,42],[-38,56],[-28,16],[-12,42],[0,0],[12,42],[28,16],[38,56],[62,42],[56,82]].forEach(p => crown.lineTo(p[0],p[1]));
  crown.quadraticCurveTo(0,60,-56,82); crown.closePath();
  const sil = new Path2D(); sil.addPath(torso); sil.addPath(face); sil.addPath(crown);
  return {halo, torso, face, crown, sil};
})();
const KSW = [
  {id:'turmeric', bn:'কাঁচা হলুদ', en:'Turmeric', c:'#f2a93b'},
  {id:'shola', bn:'শোলা সাদা', en:'Shola white', c:'#f4efe2'},
  {id:'red', bn:'লাল', en:'Red', c:'#c8321f'},
  {id:'indigo', bn:'নীল', en:'Indigo', c:'#2c4a8a'},
  {id:'green', bn:'সবুজ', en:'Green', c:'#3f8a52'}
];
const KNEED = {face:'turmeric', crown:'shola', torso:'red', halo:'indigo'};
const KPART = {face:'face', crown:'mukut', torso:'sari', halo:'chalchitra'};
const KSTEPS = [
  {bn:'কাঠামো বাঁধো', en:'Tie the frame', instr:'Tap each glowing knot to tie the straw to the bamboo frame.'},
  {bn:'মাটি লাগাও', en:'Apply the clay', instr:'Rub your finger over the straw to smooth on river clay. Cover all of it.'},
  {bn:'রং করো', en:'Paint the idol', instr:'Pick a colour, then tap the part. Face: turmeric · Mukut: shola white · Sari: red · Chalchitra (the arch): indigo.'},
  {bn:'চক্ষুদান', en:'Chokkhu daan', instr:'The eyes are painted last. Tap when the brush tip is over the glowing mark.'}
];
function startKumartuli(){
  stopGames(); show('kumartuli');
  const C = mkCanvas($('#kuCanvas'));
  const clay = document.createElement('canvas'); clay.width = 540; clay.height = 680;
  KU = {running:true, C, step:0, score:100, time:150, last:performance.now(), clay, cctx:clay.getContext('2d'),
    knots:[[0,32],[0,112],[-62,245],[62,245],[0,300]].map(([x,y]) => ({x, y, done:false})),
    grid:[], covN:0, paint:{}, sel:null, eyeIdx:0, bt:0, down:false, lastU:null, finishing:false,
    eyes:[{x:-18,y:106,m:'L'},{x:18,y:106,m:'R'},{x:0,y:79,m:'V'}]};
  for (let gx=-120; gx<=120; gx+=9) for (let gy=4; gy<=322; gy+=9) if (HCTX.isPointInPath(KPATH.sil, gx, gy)) KU.grid.push({x:gx, y:gy, c:false});
  ACTIVE = KU; KU.resize = () => { C.fit(); kuLayout(); };
  kuLayout(); kuStepUI();
  const tools = $('#kuTools'); tools.innerHTML = '';
  KSW.forEach(s => {
    const b = document.createElement('button'); b.className = 'swatch';
    b.innerHTML = `<i style="background:${s.c}"></i><span>${s.bn}</span><span class="en">${s.en}</span>`;
    b.onclick = () => { KU.sel = s.id; tools.querySelectorAll('.swatch').forEach(q => q.classList.toggle('sel', q === b)); sfx.tap(); };
    tools.appendChild(b);
  });
  requestAnimationFrame(kuLoop);
}
function kuLayout(){ const {W,H} = KU.C; KU.s = Math.min(W/272, (H-12)/335); KU.cx = W/2; KU.oy = (H - 325*KU.s)/2; }
function kuStepUI(){
  const st = KSTEPS[KU.step];
  $('#kuInstr').innerHTML = `<b>${st.bn} · ${st.en}.</b> ${st.instr}`;
  $('#kuStep').textContent = `${KU.step+1}/4`;
  $('#kuTools').hidden = KU.step !== 2;
}
function kuNext(){
  KU.step++; KU.lastU = null;
  if (KU.step >= 4) { endKumartuli(true); return; }
  kuStepUI(); sfx.dhak();
  toast($('#kuToast'), KSTEPS[KU.step].bn, KSTEPS[KU.step].en, 1300);
}
function kuProg(){
  const s = KU.step;
  if (s === 0) return KU.knots.filter(k=>k.done).length+'/5';
  if (s === 1) return Math.round(KU.covN/KU.grid.length*100)+'%';
  if (s === 2) return Object.keys(KU.paint).length+'/4';
  return Math.min(3, KU.eyeIdx)+'/3';
}
function kuBrushX(){ const e = KU.eyes[KU.eyeIdx]; return e.x + 34*Math.sin(KU.bt*(2.4 + KU.eyeIdx*.7)); }
function kuDab(p){
  const c = KU.cctx, X = (p.x+135)*2, Y = (p.y+5)*2;
  c.fillStyle = '#86553a'; c.beginPath(); c.arc(X,Y,40,0,7); c.fill();
  c.fillStyle = 'rgba(60,35,20,.35)'; for (let i=0;i<3;i++){ c.beginPath(); c.arc(X+rnd(-30,30), Y+rnd(-30,30), rnd(2,5), 0, 7); c.fill(); }
  KU.grid.forEach(g => { if (!g.c && (g.x-p.x)**2 + (g.y-p.y)**2 < 420) { g.c = true; KU.covN++; } });
}
function kuInput(u, isDown){
  const st = KU.step;
  if (st === 0 && isDown) {
    const k = KU.knots.find(k => !k.done && Math.hypot(k.x-u.x, k.y-u.y) < 28);
    if (k) { k.done = true; sfx.tak(); if (KU.knots.every(k => k.done)) setTimeout(kuNext, 300); }
  } else if (st === 1) {
    const pts = [u];
    if (KU.lastU) { const d = Math.hypot(u.x-KU.lastU.x, u.y-KU.lastU.y), n = Math.ceil(d/6); for (let i=1;i<n;i++) pts.push({x:lerp(KU.lastU.x,u.x,i/n), y:lerp(KU.lastU.y,u.y,i/n)}); }
    KU.lastU = u;
    pts.forEach(kuDab);
    if (Math.random() < .08) noise(.05,.05,500);
    if (KU.covN/KU.grid.length >= .9) kuNext();
  } else if (st === 2 && isDown) {
    const part = ['crown','face','torso','halo'].find(k => HCTX.isPointInPath(KPATH[k], u.x, u.y));
    if (!part || KU.paint[part]) return;
    if (!KU.sel) { toast($('#kuToast'), 'আগে রং বাছো', 'Pick a colour below first'); return; }
    if (KNEED[part] === KU.sel) {
      KU.paint[part] = KSW.find(s => s.id === KU.sel).c; sfx.ding();
      if (Object.keys(KU.paint).length === 4) setTimeout(kuNext, 500);
    } else {
      KU.score = Math.max(0, KU.score-8); sfx.buzz();
      toast($('#kuToast'), 'এই রং নয়!', `That isn't the colour for the ${KPART[part]}`);
    }
  } else if (st === 3 && isDown && !KU.finishing) {
    const e = KU.eyes[KU.eyeIdx]; if (!e) return;
    if (Math.abs(kuBrushX() - e.x) < 7) {
      e.done = true; KU.eyeIdx++; sfx.ding();
      if (KU.eyeIdx === 3) { KU.finishing = true; toast($('#kuToast'),'চক্ষুদান!','The eyes are painted', 1400); sfx.ulu(); setTimeout(() => sfx.shankh(), 300); setTimeout(kuNext, 1500); }
      else toast($('#kuToast'), 'ঠিক আছে!', 'Steady hand', 800);
    } else {
      KU.score = Math.max(0, KU.score-6); sfx.buzz();
      toast($('#kuToast'), 'একটু সরে গেল', 'Missed. Wait for the brush to line up');
    }
  }
}
const kuCv = $('#kuCanvas');
const kuUnit = p => ({x:(p.x-KU.cx)/KU.s, y:(p.y-KU.oy)/KU.s});
kuCv.addEventListener('pointerdown', e => { if (!KU || !KU.running) return; ac(); kuCv.setPointerCapture(e.pointerId); KU.down = true; KU.lastU = null; kuInput(kuUnit(relPt(kuCv,e)), true); });
kuCv.addEventListener('pointermove', e => { if (KU && KU.running && KU.down) kuInput(kuUnit(relPt(kuCv,e)), false); });
['pointerup','pointercancel'].forEach(t => kuCv.addEventListener(t, () => { if (KU) { KU.down = false; KU.lastU = null; } }));
function kuEye(ctx, e){
  ctx.save(); ctx.translate(e.x, e.y);
  if (e.m === 'V') { ctx.rotate(Math.PI/2); ctx.scale(.75,.75); }
  if (e.m === 'L') ctx.scale(-1,1);
  ctx.beginPath(); ctx.moveTo(-12,0); ctx.quadraticCurveTo(0,-11,13,-1); ctx.quadraticCurveTo(0,8,-12,0); ctx.closePath();
  ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke();
  if (e.m !== 'V') { ctx.beginPath(); ctx.moveTo(12,-1); ctx.lineTo(21,-6); ctx.stroke(); }
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(1,-1,4.2,0,7); ctx.fill();
  ctx.restore();
}
function drawKU(){
  const {ctx,W,H} = KU.C, st = KU.step, lw = 2.5;
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#2a1d16'); g.addColorStop(1,'#3d2a1d'); ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  const rg = ctx.createRadialGradient(W/2,0,10,W/2,0,H*.85); rg.addColorStop(0,'rgba(255,210,140,.32)'); rg.addColorStop(1,'rgba(255,210,140,0)'); ctx.fillStyle = rg; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.translate(KU.cx, KU.oy); ctx.scale(KU.s, KU.s);
  ctx.lineJoin = 'round'; ctx.strokeStyle = INK;
  if (st >= 2) {
    const hc = KU.paint.halo;
    ctx.fillStyle = hc || '#e8dcc2'; ctx.fill(KPATH.halo);
    ctx.lineWidth = lw; ctx.setLineDash(hc ? [] : [8,6]); ctx.strokeStyle = INK; ctx.stroke(KPATH.halo); ctx.setLineDash([]);
    if (hc) {
      ctx.strokeStyle = '#efb126'; ctx.lineWidth = 3;
      [112,92].forEach(r => { ctx.beginPath(); ctx.arc(0,135,r,Math.PI,0); ctx.stroke(); });
      ctx.fillStyle = '#efb126';
      for (let i=0;i<=12;i++){ const a = Math.PI + i*Math.PI/12; ctx.beginPath(); ctx.arc(Math.cos(a)*102, 135+Math.sin(a)*102, 3.5, 0, 7); ctx.fill(); }
    }
  }
  if (st <= 1) {
    ctx.fillStyle = '#9a6a32'; ctx.lineWidth = 2;
    ctx.fillRect(-7,-5,14,335); ctx.strokeRect(-7,-5,14,335);
    ctx.fillRect(-115,205,230,10); ctx.strokeRect(-115,205,230,10);
    ctx.fillStyle = '#d8b45a'; ctx.fill(KPATH.sil);
    ctx.save(); ctx.clip(KPATH.sil); ctx.strokeStyle = '#a8842f'; ctx.lineWidth = 2;
    for (let i=-400;i<400;i+=9){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+120,330); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(KPATH.sil);
    KU.knots.forEach(k => {
      if (k.done) { ctx.strokeStyle = '#c8321f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(k.x-9,k.y-9); ctx.lineTo(k.x+9,k.y+9); ctx.moveTo(k.x+9,k.y-9); ctx.lineTo(k.x-9,k.y+9); ctx.stroke(); }
      else if (st === 0) { const p = 1 + Math.sin(KU.time*6 + k.x)*.2; ctx.fillStyle = 'rgba(239,177,38,.35)'; ctx.beginPath(); ctx.arc(k.x,k.y,16*p,0,7); ctx.fill(); ctx.strokeStyle = '#efb126'; ctx.lineWidth = 2.5; ctx.stroke(); }
    });
    if (st === 1) { ctx.save(); ctx.clip(KPATH.sil); ctx.drawImage(KU.clay, -135, -5, 270, 340); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(KPATH.sil); }
  }
  if (st >= 2) {
    // hair
    ctx.fillStyle = KU.paint.face ? '#141010' : '#6e4630';
    ctx.beginPath(); ctx.ellipse(0,120,58,66,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-56,130); ctx.lineTo(-84,236); ctx.lineTo(84,236); ctx.lineTo(56,130); ctx.closePath(); ctx.fill();
    ['torso','face','crown'].forEach(k => { ctx.fillStyle = KU.paint[k] || '#8a5a3c'; ctx.fill(KPATH[k]); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(KPATH[k]); });
    if (KU.paint.torso) {
      ctx.strokeStyle = '#efb126'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-96,222); ctx.lineTo(70,325); ctx.stroke();
      ctx.lineWidth = 3.5; [34,48].forEach((r,i) => { ctx.beginPath(); ctx.arc(0,168,r,(.18+i*.04)*Math.PI,(.82-i*.04)*Math.PI); ctx.stroke(); });
    }
    if (KU.paint.crown) {
      ctx.fillStyle = '#efb126'; for (let i=-4;i<=4;i++){ ctx.beginPath(); ctx.arc(i*11, 73+Math.abs(i)*1.3, 2.6, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#c8321f'; ctx.beginPath(); ctx.arc(0,46,4.5,0,7); ctx.fill();
    }
    if (KU.paint.face) {
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
      [-1,1].forEach(sx => { ctx.beginPath(); ctx.moveTo(sx*5, 94); ctx.quadraticCurveTo(sx*20, 86, sx*36, 96); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(0,112); ctx.lineTo(-3,128); ctx.lineTo(3,129); ctx.stroke();
      ctx.fillStyle = '#a3271a'; ctx.beginPath(); ctx.ellipse(0,142,8,3.2,0,0,7); ctx.fill();
    }
    KU.eyes.forEach(e => { if (e.done) kuEye(ctx, e); });
    if (st === 3 && !KU.finishing) {
      const e = KU.eyes[KU.eyeIdx];
      if (e) {
        const p = 1 + Math.sin(KU.bt*6)*.15;
        ctx.strokeStyle = 'rgba(239,177,38,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, 9*p, 0, 7); ctx.stroke();
        const bx = kuBrushX();
        ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx+10, e.y-48); ctx.lineTo(bx, e.y-8); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(bx-3, e.y-11); ctx.lineTo(bx+3, e.y-11); ctx.lineTo(bx, e.y-2); ctx.closePath(); ctx.fill();
      }
    }
  }
  ctx.restore();
}
function kuLoop(now){
  if (!KU || !KU.running) return;
  const dt = Math.min(.1, (now-KU.last)/1000); KU.last = now;
  if (!KU.finishing) KU.time -= dt;
  if (KU.step === 3) KU.bt += dt;
  $('#kuTime').textContent = Math.max(0, Math.ceil(KU.time))+'s';
  $('#kuScore').textContent = KU.score;
  $('#kuProg').textContent = kuProg();
  drawKU();
  if (KU.time <= 0) { endKumartuli(false); return; }
  requestAnimationFrame(kuLoop);
}
function endKumartuli(win){
  KU.running = false; $('#kuTools').hidden = true;
  setTimeout(() => showResult({
    stop:'kumartuli', win, best: win ? KU.score : null,
    title: win ? 'প্রতিমা তৈরি!' : 'সময় পেরিয়ে গেল',
    sub: win ? `Your protima is ready for the pandal. Score ${KU.score}/100.` : 'The idol was not finished in time. The pandal is waiting, so try again.',
    fact:'Kumartuli in north Kolkata has been the potters\' quarter for about 300 years. Idols are built on bamboo and straw frames called kathamo and coated with clay from the Hooghly. The eyes are painted last, in a ritual called chokkhu daan, traditionally on Mahalaya.'
  }), 400);
}

/* =========================================================
   STOP 6 · ROOFTOP KITES (Ghuddi fight)
   ========================================================= */
let KT = null;
const RIVAL_COLS = [['#2c4a8a','#f6ead0'],['#3f8a52','#efb126'],['#8a5cc4','#f6ead0'],['#1d1410','#d23b22'],['#f6ead0','#2c4a8a']];
const RIVAL_FX = [.1,.9,.28,.72];
function ktRoofs(){ const o = []; let x = -.02; while (x < 1.02){ const w = rnd(.1,.17); o.push({x0:x, x1:x+w, h:rnd(.1,.2), tank:Math.random()<.5, ant:Math.random()<.4, lit:Array.from({length:12}, () => Math.random()<.45)}); x += w + rnd(0,.015); } return o; }
function ktRoofAt(fx){ return KT.roofs.find(r => fx >= r.x0 && fx <= r.x1) || KT.roofs[0]; }
function ktAnchor(fx){ const {W,H} = KT.C, r = ktRoofAt(fx), ry = H*(1-r.h); return {x:W*fx+4, y:ry-18, ry}; }
function startGhuddi(){
  stopGames(); show('ghuddi');
  const C = mkCanvas($('#ktCanvas'));
  KT = {running:true, C, cuts:0, lives:3, t:0, last:performance.now(), rivals:[], spawnT:1.2, tangle:null, roofs:ktRoofs(),
        deco:Array.from({length:6}, () => ({fx:Math.random(), fy:rnd(.05,.4), c:pick(RIVAL_COLS), ph:rnd(0,6)}))};
  const A = ktAnchor(.5);
  KT.me = {x:A.x, y:A.y-20, tx:A.x, ty:C.H*.4, cut:false, fall:0, rot:0, vx:0};
  ACTIVE = KT; KT.resize = () => C.fit();
  KT.onKey = e => {
    if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) ktPull(); return true; }
    const m = {ArrowLeft:[-30,0], ArrowRight:[30,0], ArrowUp:[0,-30], ArrowDown:[0,30]}[e.key];
    if (!m) return false;
    if (!KT.me.cut) { KT.me.tx += m[0]; KT.me.ty += m[1]; }
    return true;
  };
  ktHud(); requestAnimationFrame(ktLoop);
}
const ktCv = $('#ktCanvas');
function ktSteer(e){ if (!KT || !KT.running || KT.me.cut) return; const p = relPt(ktCv, e); KT.me.tx = p.x; KT.me.ty = p.y; }
ktCv.addEventListener('pointerdown', e => { if (!KT || !KT.running) return; ac(); ktCv.setPointerCapture(e.pointerId); KT.dragging = true; ktSteer(e); });
ktCv.addEventListener('pointermove', e => { if (KT && KT.dragging) ktSteer(e); });
['pointerup','pointercancel'].forEach(t => ktCv.addEventListener(t, () => { if (KT) KT.dragging = false; }));
$('#ktPull').addEventListener('pointerdown', e => { e.preventDefault(); ktPull(); });
$('#ktPull').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); });
function ktPull(){ if (!KT || !KT.running || !KT.tangle) return; KT.tangle.pm += .12; sfx.tap(); }
function ktSpawn(){
  const used = KT.rivals.filter(r => !r.cut).map(r => r.fx);
  const fx = pick(RIVAL_FX.filter(f => !used.includes(f))), a = ktAnchor(fx), col = pick(RIVAL_COLS);
  KT.rivals.push({fx, x:a.x, y:a.y-20, tx:a.x+rnd(-60,60), ty:KT.C.H*rnd(.15,.45), rt:2, cool:1.2, cut:false, fall:0, rot:0, c1:col[0], c2:col[1]});
}
function segX(a,b,c,d){
  const rx = b.x-a.x, ry = b.y-a.y, sx = d.x-c.x, sy = d.y-c.y, den = rx*sy - ry*sx;
  if (Math.abs(den) < 1e-6) return null;
  const t = ((c.x-a.x)*sy - (c.y-a.y)*sx)/den, u = ((c.x-a.x)*ry - (c.y-a.y)*rx)/den;
  return (t > .05 && t < .97 && u > .05 && u < .97) ? {x:a.x+t*rx, y:a.y+t*ry} : null;
}
function ktHud(){
  $('#ktCuts').textContent = `${KT.cuts}/5`;
  $('#ktKites').textContent = '◆'.repeat(Math.max(0,KT.lives)) + '◇'.repeat(3-Math.max(0,KT.lives));
  $('#ktTime').textContent = Math.floor(KT.t)+'s';
}
function ktLoop(now){
  if (!KT || !KT.running) return;
  const dt = Math.min(.05, (now-KT.last)/1000); KT.last = now; KT.t += dt;
  const {W,H} = KT.C, A = ktAnchor(.5);
  let me = KT.me;
  // player kite
  if (!me.cut) {
    me.tx = clamp(me.tx, 24, W-24); me.ty = clamp(me.ty, H*.07, H*.66);
    const dx = me.tx-me.x, dy = me.ty-me.y, d = Math.hypot(dx,dy), sp = (KT.tangle ? 30 : 250)*dt, ox = me.x;
    if (d > 2) { const s = Math.min(d, sp); me.x += dx/d*s; me.y += dy/d*s; }
    me.vx = (me.x-ox)/dt;
  } else {
    me.fall += dt; me.x += 45*dt; me.y += 85*dt; me.rot += 4*dt;
    if (me.fall > 1.8 && KT.lives > 0) { KT.me = me = {x:A.x, y:A.y-20, tx:A.x+rnd(-40,40), ty:H*.4, cut:false, fall:0, rot:0, vx:0}; }
  }
  // rivals
  KT.spawnT -= dt;
  const active = KT.rivals.filter(r => !r.cut).length, maxR = KT.cuts >= 2 ? 2 : 1;
  if (active < maxR && KT.spawnT <= 0) { ktSpawn(); KT.spawnT = 2.5; }
  KT.rivals.forEach(r => {
    if (r.cut) { r.fall += dt; r.x += 50*dt; r.y += 70*dt; r.rot += 3*dt; return; }
    r.cool -= dt; r.rt -= dt;
    if (r.rt <= 0) {
      r.rt = rnd(1.8,3.5);
      if (!me.cut && Math.random() < .35 + KT.cuts*.08) { const k = rnd(.55,.85); r.tx = lerp(A.x,me.x,k)+rnd(-40,40); r.ty = lerp(A.y,me.y,k)+rnd(-40,40); }
      else { r.tx = rnd(30, W-30); r.ty = rnd(H*.08, H*.6); }
      r.tx = clamp(r.tx, 24, W-24); r.ty = clamp(r.ty, H*.08, H*.62);
    }
    if (KT.tangle && KT.tangle.r === r) return;
    const dx = r.tx-r.x, dy = r.ty-r.y, d = Math.hypot(dx,dy) || 1, sp = (80 + KT.cuts*12)*dt;
    if (d > 4) { r.x += dx/d*Math.min(d,sp); r.y += dy/d*Math.min(d,sp); }
  });
  KT.rivals = KT.rivals.filter(r => !(r.cut && r.fall > 3));
  // tangles
  if (!KT.tangle && !me.cut) {
    for (const r of KT.rivals) {
      if (r.cut || r.cool > 0) continue;
      const pt = segX(A, me, ktAnchor(r.fx), r);
      if (pt) { KT.tangle = {r, pm:0, rm:0, pt}; $('#ktPull').hidden = false; sfx.tak(); toast($('#ktToast'),'প্যাঁচ!','Tangle! Tap Pull fast', 1100); break; }
    }
  }
  if (KT.tangle) {
    const tg = KT.tangle, r = tg.r;
    tg.pt = segX(A, me, ktAnchor(r.fx), r) || tg.pt;
    tg.rm += (.3 + KT.cuts*.045)*dt;
    if (tg.pm >= 1) {
      r.cut = true; r.fall = 0; KT.cuts++; KT.tangle = null; $('#ktPull').hidden = true;
      sfx.dhak(); sfx.ding(); toast($('#ktToast'),'ভো কাট্টা!','Bho-katta! You cut their kite', 1300);
      if (KT.cuts >= 5) { ktHud(); endGhuddi(true); return; }
    } else if (tg.rm >= 1) {
      me.cut = true; me.fall = 0; KT.lives--; r.cool = 2.5; KT.tangle = null; $('#ktPull').hidden = true;
      sfx.lose(); toast($('#ktToast'),'কেটে গেল!', KT.lives > 0 ? 'Your kite was cut. A new one is going up.' : 'Your last kite was cut', 1400);
      if (KT.lives <= 0) { ktHud(); drawKT(); KT.running = false; setTimeout(() => endGhuddi(false), 1200); return; }
    }
  }
  ktHud(); drawKT();
  requestAnimationFrame(ktLoop);
}
function drawKite(ctx,x,y,c1,c2,rot,sc=1){
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.scale(sc,sc);
  ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(-16,0); ctx.lineTo(0,22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(16,0); ctx.lineTo(0,22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(16,0); ctx.lineTo(0,22); ctx.lineTo(-16,0); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(0,22); ctx.moveTo(-16,0); ctx.quadraticCurveTo(0,-9,16,0); ctx.stroke();
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(0,22); ctx.lineTo(-6,31); ctx.lineTo(6,31); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function ktString(ctx,a,k,col,w){ ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo((a.x+k.x)/2, (a.y+k.y)/2+16, k.x, k.y+6); ctx.stroke(); }
function ktPerson(ctx,fx,col){
  const a = ktAnchor(fx), x = a.x-4, y = a.ry;
  ctx.fillStyle = col; ctx.fillRect(x-4,y-20,8,14);
  ctx.strokeStyle = '#151018'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x-2,y-6); ctx.lineTo(x-3,y); ctx.moveTo(x+2,y-6); ctx.lineTo(x+3,y); ctx.moveTo(x+3,y-17); ctx.lineTo(a.x,a.y); ctx.stroke();
  ctx.fillStyle = '#6b4329'; ctx.beginPath(); ctx.arc(x,y-25,5,0,7); ctx.fill();
}
function drawKT(){
  const {ctx,W,H} = KT.C, t = KT.t, me = KT.me, A = ktAnchor(.5);
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#5d86c9'); g.addColorStop(.62,'#f0b46a'); g.addColorStop(1,'#e57a54');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = 'rgba(255,226,160,.9)'; ctx.beginPath(); ctx.arc(W*.82, H*.2, 24, 0, 7); ctx.fill();
  KT.deco.forEach(d => drawKite(ctx, d.fx*W, d.fy*H + Math.sin(t*1.5+d.ph)*4, d.c[0], d.c[1], Math.sin(t+d.ph)*.15, .4));
  // rooftops
  KT.roofs.forEach((r,i) => {
    const x0 = r.x0*W, x1 = r.x1*W, top = H*(1-r.h), rw = x1-x0;
    ctx.fillStyle = i%2 ? '#2e2238' : '#3a2a40'; ctx.fillRect(x0, top, rw, H-top);
    ctx.fillStyle = '#24192c'; ctx.fillRect(x0-2, top-5, rw+4, 6);
    const ww = rw/7, wh = (H-top)/9;
    r.lit.forEach((on,k) => { const c = k%3, rr = Math.floor(k/3); ctx.fillStyle = on ? 'rgba(239,177,38,.75)' : 'rgba(10,8,20,.5)'; ctx.fillRect(x0+ww*(1+c*2), top+wh*(1+rr*2)+4, ww, wh*.8); });
    if (r.tank) { ctx.fillStyle = '#151018'; ctx.fillRect(x0+rw*.62, top-22, 18, 18); }
    if (r.ant) { const ax = x0+rw*.25; ctx.strokeStyle = '#151018'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax,top-5); ctx.lineTo(ax,top-34); ctx.moveTo(ax-10,top-28); ctx.lineTo(ax+10,top-28); ctx.moveTo(ax-7,top-20); ctx.lineTo(ax+7,top-20); ctx.stroke(); }
  });
  ktPerson(ctx, .5, '#d23b22');
  KT.rivals.forEach(r => { if (!r.cut) ktPerson(ctx, r.fx, '#f6ead0'); });
  // strings
  KT.rivals.forEach(r => { if (!r.cut) ktString(ctx, ktAnchor(r.fx), r, 'rgba(40,25,30,.85)', 1.3); });
  if (!me.cut) ktString(ctx, A, me, '#fff8e6', 1.6);
  // kites
  KT.rivals.forEach(r => { ctx.globalAlpha = r.cut ? Math.max(0, 1-r.fall/3) : 1; drawKite(ctx, r.x, r.y, r.c1, r.c2, r.cut ? r.rot : Math.sin(t*2+r.fx*9)*.12); ctx.globalAlpha = 1; });
  drawKite(ctx, me.x, me.y + (me.cut ? 0 : Math.sin(t*2.4)*2), '#d23b22', '#efb126', me.cut ? me.rot : Math.sin(t*2)*.1 + clamp(me.vx*.002,-.35,.35));
  // tangle effects and meters
  if (KT.tangle) {
    const p = KT.tangle.pt;
    for (let i=0;i<6;i++){ const a = t*9+i; ctx.strokeStyle = i%2 ? '#fff6d8' : '#efb126'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+Math.cos(a)*14, p.y+Math.sin(a)*14); ctx.stroke(); }
    const bw = Math.min(130, W*.38), y = 12;
    [['তুমি · You', KT.tangle.pm, '#efb126', W/2-bw-6], ['ওরা · Rival', KT.tangle.rm, '#d23b22', W/2+6]].forEach(([lab,v,col,x]) => {
      ctx.fillStyle = 'rgba(18,26,51,.85)'; ctx.fillRect(x, y, bw, 34);
      ctx.fillStyle = col; ctx.fillRect(x+3, y+3, (bw-6)*clamp(v,0,1), 12);
      ctx.fillStyle = '#f6ead0'; ctx.font = "600 11px 'Hind Siliguri', sans-serif"; ctx.textAlign = 'left'; ctx.fillText(lab, x+5, y+29);
    });
  }
}
function endGhuddi(win){
  KT.running = false; $('#ktPull').hidden = true;
  const secs = Math.round(KT.t);
  setTimeout(() => showResult({
    stop:'ghuddi', win, best:secs,
    title: win ? 'ভো কাট্টা!' : 'সব ঘুড়ি কাটা গেল',
    sub: win ? `You cut five kites in ${secs} seconds and kept ${KT.lives} of your own.` : `You cut ${KT.cuts} of 5 kites before losing all three of yours.`,
    fact:'In Kolkata, Vishwakarma Puja in September is the big kite-flying day, and a cut kite is greeted with shouts of "bho-katta!" Glass-coated manja string injures birds and people, and many places now restrict it, so plain cotton thread is the safer choice.'
  }), 800);
}

/* =========================================================
   STOP 7 · DURGA PUJO FINALE (Dhunuchi rhythm)
   ========================================================= */
let DP = null;
const LANE_COL = ['#efb126','#d23b22','#f6ead0'];
const DP_TRAVEL = 1.5;
function dpChart(){
  const secs = [
    {bpm:96,  pats:[[1,0,0,0,1,0,0,0],[1,0,0,0,1,0,1,0]]},
    {bpm:108, pats:[[1,0,1,0,1,0,1,0],[1,0,0,1,1,0,1,0]]},
    {bpm:120, pats:[[1,0,1,1,1,0,1,0],[1,1,1,0,1,0,1,1]]},
    {bpm:132, pats:[[1,0,1,1,1,0,1,1],[1,1,1,0,1,1,1,0],[1,0,1,0,1,1,1,1]]}
  ];
  const notes = [], beats = []; let t = 0, last = -1, run = 0;
  secs.forEach((s,si) => {
    const e = 60/s.bpm/2;
    for (let bar=0; bar<6; bar++){
      const pat = (bar === 5 && si < 3) ? [1,0,1,0,1,1,1,0] : pick(s.pats);
      pat.forEach((v,k) => {
        beats.push({t, strong:k%2===0});
        if (v) { let lane = Math.floor(Math.random()*3); if (lane === last && run >= 1) lane = (lane + 1 + Math.floor(Math.random()*2)) % 3; run = lane === last ? run+1 : 0; last = lane; notes.push({t, lane, j:false}); }
        t += e;
      });
    }
  });
  return {notes, beats, end:t+1.2};
}
const dpNow = () => (performance.now() - DP.t0)/1000;
function startPujo(){
  stopGames(); show('pujo');
  const C = mkCanvas($('#dpCanvas'));
  DP = {running:true, C, ...dpChart(), t0:performance.now()+3000, score:0, combo:0, maxCombo:0, perfect:0, good:0, miss:0, bi:0, fx:[], smoke:[], press:[0,0,0], last:performance.now(), cd:4};
  ACTIVE = DP; DP.resize = () => C.fit();
  DP.onKey = e => { const m = {ArrowLeft:0,a:0,A:0,j:0,J:0,ArrowDown:1,ArrowUp:1,s:1,S:1,w:1,W:1,k:1,K:1,ArrowRight:2,d:2,D:2,l:2,L:2}[e.key]; if (m == null) return false; if (!e.repeat) dpHit(m); return true; };
  sfx.shankh();
  requestAnimationFrame(dpLoop);
}
function dpGeo(){ const {W,H} = DP.C, lw = Math.min(W/3.3, 120); return {lw, x0:W/2-lw*1.5, hitY:H*.8, topY:H*.03}; }
const dpCv = $('#dpCanvas');
dpCv.addEventListener('pointerdown', e => { if (!DP || !DP.running) return; ac(); const p = relPt(dpCv, e), g = dpGeo(); dpHit(clamp(Math.floor((p.x-g.x0)/g.lw), 0, 2)); });
function dpFx(l, bn, en, col){ DP.fx.push({l, bn, en, col, life:1}); }
function dpHit(l){
  if (!DP || !DP.running) return;
  DP.press[l] = 1;
  const T = dpNow(); let best = null, bd = .17;
  for (const n of DP.notes){ if (n.t - T > .2) break; if (n.j || n.lane !== l) continue; const d = Math.abs(n.t - T); if (d < bd) { bd = d; best = n; } }
  if (!best) return;
  best.j = true;
  const perfect = bd < .07;
  if (perfect) { DP.perfect++; DP.score += 100 + DP.combo*2; } else { DP.good++; DP.score += 60 + DP.combo; }
  DP.combo++; DP.maxCombo = Math.max(DP.maxCombo, DP.combo);
  sfx.tak(); tone(150,.18,'sine',.35,60);
  dpFx(l, perfect ? 'দারুণ' : 'ভালো', perfect ? 'Perfect' : 'Good', perfect ? '#efb126' : '#f6ead0');
  for (let i=0;i<6;i++) DP.smoke.push({l, x:rnd(-14,14), y:0, vx:rnd(-12,12), vy:rnd(-60,-30), r:rnd(5,9), life:1});
}
function dpLoop(now){
  if (!DP || !DP.running) return;
  const dt = Math.min(.05, (now-DP.last)/1000); DP.last = now;
  const T = dpNow();
  if (T < 0) { const c = Math.ceil(-T); if (c !== DP.cd) { DP.cd = c; sfx.tak(); } }
  while (DP.bi < DP.beats.length && DP.beats[DP.bi].t <= T + .12) {
    const b = DP.beats[DP.bi++], d = Math.max(0, b.t - T);
    if (b.strong) tone(105,.22,'sine',.28,48,d); else sfx.bell(d);
  }
  for (const n of DP.notes){ if (n.j) continue; if (T - n.t > .17) { n.j = true; DP.miss++; DP.combo = 0; dpFx(n.lane,'মিস','Miss','#ff8a6b'); } else break; }
  DP.press = DP.press.map(p => Math.max(0, p - dt*4));
  DP.fx.forEach(f => f.life -= dt*1.4); DP.fx = DP.fx.filter(f => f.life > 0);
  DP.smoke.forEach(s => { s.x += s.vx*dt; s.y += s.vy*dt; s.r += dt*14; s.life -= dt*.9; }); DP.smoke = DP.smoke.filter(s => s.life > 0);
  const judged = DP.perfect + DP.good + DP.miss;
  $('#dpScore').textContent = DP.score; $('#dpCombo').textContent = DP.combo;
  $('#dpAcc').textContent = (judged ? Math.round((DP.perfect + DP.good*.6)/judged*100) : 100) + '%';
  drawDP(T, now/1000);
  if (T > DP.end) { endPujo(); return; }
  requestAnimationFrame(dpLoop);
}
function dpBurner(ctx,cx,y,p){
  if (p > 0) { const g = ctx.createRadialGradient(cx,y-4,2,cx,y-4,42); g.addColorStop(0,`rgba(255,170,60,${.7*p})`); g.addColorStop(1,'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,y-4,42,0,7); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.fillStyle = '#b4532a'; ctx.beginPath(); ctx.moveTo(cx-24,y); ctx.quadraticCurveTo(cx,y+34,cx+24,y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ef8a24'; ctx.beginPath(); ctx.ellipse(cx,y,24,5,0,0,7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9a4423'; ctx.beginPath(); ctx.moveTo(cx-6,y+16); ctx.lineTo(cx-8,y+28); ctx.lineTo(cx+8,y+28); ctx.lineTo(cx+6,y+16); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b4532a'; ctx.beginPath(); ctx.ellipse(cx,y+30,14,4.5,0,0,7); ctx.fill(); ctx.stroke();
}
function dpFlame(ctx,cx,y,col,tt){
  const g = ctx.createRadialGradient(cx,y,1,cx,y,22); g.addColorStop(0,'rgba(255,250,230,.95)'); g.addColorStop(.35,col); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,y,22,0,7); ctx.fill();
  const f = Math.sin(tt*14+cx)*2; ctx.fillStyle = '#fff6d8';
  ctx.beginPath(); ctx.moveTo(cx-6,y+2); ctx.quadraticCurveTo(cx+f,y-20,cx+6,y+2); ctx.quadraticCurveTo(cx,y+8,cx-6,y+2); ctx.fill();
}
function drawDP(T, tt){
  const {ctx,W,H} = DP.C, {lw,x0,hitY,topY} = dpGeo();
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1c0f30'); g.addColorStop(1,'#33123a'); ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  const rg = ctx.createRadialGradient(W/2,H*.3,10,W/2,H*.3,Math.max(W,H)*.6); rg.addColorStop(0,'rgba(239,177,38,.26)'); rg.addColorStop(1,'rgba(239,177,38,0)'); ctx.fillStyle = rg; ctx.fillRect(0,0,W,H);
  const ar = Math.min(W*.46, H*.36);
  ctx.strokeStyle = 'rgba(239,177,38,.4)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(W/2,H*.38,ar,Math.PI,0); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W/2,H*.38,ar*.86,Math.PI,0); ctx.stroke();
  for (let s=0;s<3;s++){ const y0 = H*(.05+s*.07); let k = 0; for (let x=8; x<W; x+=18, k++){ const u = x/W, y = y0 + 26*4*u*(1-u); ctx.globalAlpha = .35 + .65*Math.abs(Math.sin(tt*3 + k*.7 + s)); ctx.fillStyle = LANE_COL[(k+s)%3]; ctx.beginPath(); ctx.arc(x,y,2.6,0,7); ctx.fill(); } }
  ctx.globalAlpha = 1;
  for (let l=0;l<3;l++){ ctx.fillStyle = `rgba(246,234,208,${.04 + DP.press[l]*.12})`; ctx.fillRect(x0+l*lw+3, 0, lw-6, H); }
  ctx.strokeStyle = 'rgba(239,177,38,.6)'; ctx.setLineDash([6,8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0,hitY); ctx.lineTo(x0+lw*3,hitY); ctx.stroke(); ctx.setLineDash([]);
  for (let l=0;l<3;l++) dpBurner(ctx, x0+lw*(l+.5), hitY, DP.press[l]);
  for (const n of DP.notes){ if (n.j) continue; const d = n.t - T; if (d > DP_TRAVEL) break; dpFlame(ctx, x0+lw*(n.lane+.5), hitY - (d/DP_TRAVEL)*(hitY-topY), LANE_COL[n.lane], tt); }
  DP.smoke.forEach(s => { ctx.fillStyle = `rgba(200,195,215,${s.life*.35})`; ctx.beginPath(); ctx.arc(x0+lw*(s.l+.5)+s.x, hitY-14+s.y, s.r, 0, 7); ctx.fill(); });
  ctx.textAlign = 'center';
  DP.fx.forEach(f => { const cx = x0+lw*(f.l+.5), y = hitY-52-(1-f.life)*30; ctx.globalAlpha = Math.min(1, f.life*1.5); ctx.fillStyle = f.col; ctx.font = "22px Galada, 'Hind Siliguri', cursive"; ctx.fillText(f.bn, cx, y); ctx.font = "600 11px 'Hind Siliguri', sans-serif"; ctx.fillText(f.en, cx, y+14); });
  ctx.globalAlpha = 1;
  const pr = clamp(T/DP.end, 0, 1); ctx.fillStyle = 'rgba(246,234,208,.15)'; ctx.fillRect(0,0,W,4); ctx.fillStyle = '#efb126'; ctx.fillRect(0,0,W*pr,4);
  if (T < 0) {
    ctx.fillStyle = '#efb126'; ctx.font = `${Math.round(Math.min(W,H)*.22)}px Galada, cursive`; ctx.fillText(toBn(Math.ceil(-T)), W/2, H*.45);
    ctx.font = "600 14px 'Hind Siliguri', sans-serif"; ctx.fillStyle = '#f6ead0'; ctx.fillText('Tap each lane as its flame arrives', W/2, H*.45+32);
  }
}
function endPujo(){
  DP.running = false;
  const total = DP.notes.length, acc = (DP.perfect + DP.good*.6)/total, win = acc >= .6, pct = Math.round(acc*100);
  setTimeout(() => showResult({
    stop:'pujo', win, best:DP.score,
    title: win ? 'শুভ বিজয়া!' : 'আরেকবার নাচো',
    sub: win ? `Accuracy ${pct}%, best combo ${DP.maxCombo}, score ${DP.score}. Your jhuli is full and the journey is complete.` : `Accuracy ${pct}%. You need 60% to finish the journey. Score ${DP.score}.`,
    fact:'UNESCO added Durga Puja in Kolkata to its list of the Intangible Cultural Heritage of Humanity in 2021. The dhunuchi naach is danced at the evening arati, holding clay burners of smouldering coconut husk and incense, to the beat of the dhak.'
  }), 500);
}
