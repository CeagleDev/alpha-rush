/**
 * home.js — the HOME screen (UI v2): character select carousel, the five tabs, header chips. (index.html owns CSS)
 *
 *   ROSTER        the three characters (id, name, title, asset, story, colours, stats). player.js may read
 *                 state.character / state.characterAsset, which main.js writes from selected() before 'start'.
 *   init(ctx)     builds the carousel, dots and tab bar into #home, restores the saved selection
 *   selected()    the ROSTER entry currently in the middle of the carousel
 *   show() / hide() / refresh()     main.js shows HOME at boot and after quit(); 'start' hides it (hud.js)
 *
 * Tabs: ACHIEVEMENTS, PLAYERS (default: the carousel + #startb), MISSIONS, TASKS, POWER-UPS. Every pane other
 * than PLAYERS is re-rendered from progress.js each time it is opened, so nothing here runs per frame.
 * The stat bars on the cards are presentational only (the runner does not read them yet).
 */
export const ROSTER = [
  { id: 'ronin', name: 'KAITO', title: 'The Last Ronin', asset: 'hero_ronin', mono: 'K', c1: '#2a2e8c', c2: '#ff2d3a', fg: '#fff',
    story: 'A masterless swordsman who sold his armour and kept the blade. He runs the night streets to outpace the debt collectors’ dogs.',
    stats: { speed: 3, jump: 4, luck: 2 } },
  { id: 'kitsune', name: 'YUZU', title: 'Shrine Courier', asset: 'hero_kitsune', mono: 'Y', c1: '#efe9f4', c2: '#ff4a1c', fg: '#1a1020',
    story: 'A fox-spirit messenger who carries talismans between shrines. The pack is hunting the bells on her belt.',
    stats: { speed: 4, jump: 3, luck: 4 } },
  { id: 'oni', name: 'RAIDEN', title: 'Neon Oni', asset: 'hero_oni', mono: 'R', c1: '#ff7a1a', c2: '#22e8ff', fg: '#1a0e00',
    story: 'A rooftop mechanic who built his own jet-boots and stole the wrong scooter. Now every dog in the ward wants him.',
    stats: { speed: 5, jump: 5, luck: 1 } },
];
const STAT_KEYS = [['speed', 'Speed'], ['jump', 'Jump'], ['luck', 'Luck']];
const TABS = [
  ['achievements', 'Achievements', '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v3M8 20h8M10 17h4v3h-4z"/>'],
  ['players', 'Players', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'],
  ['missions', 'Missions', '<path d="M5 21V4M5 4h13l-2.5 4L18 12H5"/>'],
  ['tasks', 'Tasks', '<path d="M4 6l2 2 3-3M4 12l2 2 3-3M4 18l2 2 3-3M12 6h8M12 12h8M12 18h8"/>'],
  ['powerups', 'Power-ups', '<path d="M13 2L5 13h6l-1 9 9-12h-6z"/>'],
];
const POWER_UI = {
  magnet: { name: 'Magnet', tag: 'M', color: '#ff5a4a', desc: 'Pulls every coin from all three lanes to you.' },
  omamori: { name: 'Charm', tag: 'C', color: '#7fd4ff', desc: 'Absorbs one crash, then it is spent.' },
  x2: { name: 'x2 Score', tag: 'x2', color: '#ffb300', desc: 'Doubles the score multiplier while it lasts.' },
  sneakers: { name: 'Super Jump', tag: 'J', color: '#5af0d0', desc: 'Jumps reach 1.75 m instead of 1.1 m.' },
};
const POWER_DUR = { magnet: 10, omamori: 20, x2: 12, sneakers: 10 };

let ctx = null, P = null, idx = 0, tab = 'players', el = {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bar = (have, goal) => `<div class="bar"><b style="width:${Math.round(100 * Math.min(1, goal ? have / goal : 0))}%"></b></div>`;

export function selected() { return ROSTER[idx]; }
/** Select by roster id (tools and tests; the tab bar uses the carousel). */
export function choose(id) { const i = ROSTER.findIndex((r) => r.id === id); if (i >= 0) select(i); return i >= 0; }

function cardHtml(r, i) {
  const segs = (n) => Array.from({ length: 5 }, (_, k) => `<b${k < n ? ' class="on"' : ''}></b>`).join('');
  return `<div class="card panel" data-i="${i}" style="--c1:${r.c1};--c2:${r.c2};--fg:${r.fg}">
    <div class="art"><div class="ring"></div><div class="idx d" style="color:var(--fg)">runner<b>0${i + 1}</b></div><div class="mono d">${r.mono}</div><div class="tag d">${esc(r.id)}</div></div>
    <div class="info"><div class="name d">${esc(r.name)}</div><div class="title">${esc(r.title)}</div><p class="story">${esc(r.story)}</p>
    <div class="stats">${STAT_KEYS.map(([k, l]) => `<div class="st"><i>${l}</i><div class="segs">${segs(r.stats[k])}</div></div>`).join('')}</div></div></div>`;
}

function select(i, persist = true) {
  idx = (i + ROSTER.length) % ROSTER.length;
  const r = ROSTER[idx];
  el.track.style.transform = `translateX(calc(6% - ${idx * 88}%))`;   // cards are 86% + 1% margins each side
  [...el.track.children].forEach((c, k) => c.classList.toggle('on', k === idx));
  [...el.dots.children].forEach((c, k) => c.classList.toggle('on', k === idx));
  if (el.who) el.who.textContent = `${idx + 1} / ${ROSTER.length}`;
  if (ctx) { ctx.state.character = r.id; ctx.state.characterAsset = r.asset; }
  if (persist && P && P.setCharacter) P.setCharacter(r.id);
}

function setTab(id) {
  tab = id;
  for (const [t] of TABS) { const p = $('pane-' + t); if (p) p.classList.toggle('on', t === id); }
  [...el.tabs.children].forEach((b) => b.classList.toggle('on', b.dataset.tab === id));
  renderPane(id);
}

function renderHeader() {
  if (!P) return;
  const sum = P.summary ? P.summary() : null;
  if (el.best && sum) el.best.textContent = String(sum.best | 0);
  if (el.bank) el.bank.textContent = String(P.bank ? P.bank() : 0);
}

function renderPane(id) {
  if (!P || id === 'players') return;
  const pane = $('pane-' + id); if (!pane) return;
  if (id === 'missions') {
    const s = P.summary();
    pane.innerHTML = `<div class="phead"><b>Missions</b><em>set ${s.set + 1}</em></div>
      <div class="mchip"><span>multiplier <b>x${s.mult}</b></span><span>sets done <b>${s.set}</b></span><span>runs <b>${s.runs | 0}</b></span></div>` +
      s.missions.map((m) => `<div class="row${m.done ? ' done' : ''}"><div class="rt"><span>${esc(m.text)}</span><em>${m.done ? 'done' : `${m.have} / ${m.goal}`}</em></div>${bar(m.have, m.goal)}</div>`).join('') +
      `<div class="phead" style="margin-top:6px"><em>finish all three and the multiplier goes up for good</em></div>`;
  } else if (id === 'tasks') {
    const d = P.daily();
    pane.innerHTML = `<div class="phead"><b>Daily tasks</b><em>reset at midnight</em></div>` +
      d.map((t) => `<div class="row${t.done ? ' done' : ''}"><div class="rt"><span>${esc(t.text)}</span><em>${t.done ? 'paid' : `${t.have.toLocaleString('en-US')} / ${t.goal.toLocaleString('en-US')}`}</em></div>${bar(t.have, t.goal)}<div class="pay">${t.done ? 'paid' : 'reward'} · +${t.pay} coins to the bank</div></div>`).join('');
  } else if (id === 'achievements') {
    const a = P.achievements(), n = a.filter((x) => x.unlocked).length;
    pane.innerHTML = `<div class="phead"><b>Achievements</b><em>${n} / ${a.length}</em></div><div class="grid">` +
      a.map((x) => `<div class="badge${x.unlocked ? ' un' : ''}"><div class="lock"></div><div class="hex">${esc(x.tag)}</div><div class="bn">${esc(x.name)}</div><div class="bd">${esc(x.desc)}</div></div>`).join('') + '</div>';
  } else if (id === 'powerups') {
    const lv = P.powerLevels(), bank = P.bank(), T = (ctx.modules.powerups && ctx.modules.powerups.TYPES) || {};
    pane.innerHTML = `<div class="phead"><b>Power-ups</b><em>bank ${bank} coins</em></div>` + Object.keys(POWER_UI).map((k) => {
      const u = POWER_UI[k], n = lv[k] | 0, max = n >= 5, cost = P.powerCost(k), base = (T[k] && T[k].dur) || POWER_DUR[k];
      const dur = (l) => (base * (1 + 0.2 * (l - 1))).toFixed(1).replace(/\.0$/, '');
      const segs = Array.from({ length: 5 }, (_, i) => `<b${i < n ? ' class="on"' : ''}></b>`).join('');
      const can = !max && bank >= cost;
      return `<div class="row pw" style="--pc:${u.color}"><div class="ico">${u.tag}</div><div class="mid"><div class="rt"><span>${u.name}</span><em>${dur(n)} s${max ? '' : ` → ${dur(n + 1)} s`}</em></div>
        <div class="desc">${u.desc}</div><div class="lv">level ${n}<div class="segs">${segs}</div></div></div>
        <button class="up${max ? ' max' : ''}" type="button" data-up="${k}" ${can ? '' : 'disabled'}>${max ? 'MAX' : `Upgrade<small>${cost} coins</small>`}</button></div>`;
    }).join('');
  }
}

export function refresh() { renderHeader(); renderPane(tab); }
export function show() { refresh(); const h = $('home'); if (h) h.classList.add('on'); }
export function hide() { const h = $('home'); if (h) h.classList.remove('on'); }

export async function init(c) {
  ctx = c; P = c.modules && c.modules.progress;
  el = { track: $('h-track'), dots: $('h-dots'), tabs: $('h-tabs'), best: $('h-best'), bank: $('h-bank'), who: $('h-who'), car: $('h-car') };
  if (!el.track) return;
  el.track.innerHTML = ROSTER.map(cardHtml).join('');
  el.dots.innerHTML = ROSTER.map(() => '<i></i>').join('');
  el.tabs.innerHTML = TABS.map(([id, label, path]) => `<button class="tab" type="button" data-tab="${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg><span>${label}</span></button>`).join('');
  el.tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
  $('h-prev').addEventListener('click', () => select(idx - 1));
  $('h-next').addEventListener('click', () => select(idx + 1));
  // swipe (any pointer) and tap on a side card
  let px = 0, py = 0, pid = null;
  el.car.addEventListener('pointerdown', (e) => { if (e.target.closest('.arrow')) return; pid = e.pointerId; px = e.clientX; py = e.clientY; });
  el.car.addEventListener('pointerup', (e) => {
    if (e.pointerId !== pid) return; pid = null;
    const dx = e.clientX - px, dy = e.clientY - py;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) { select(idx + (dx < 0 ? 1 : -1)); return; }
    if (Math.hypot(dx, dy) < 12) { const card = e.target.closest('.card'); if (card && Number(card.dataset.i) !== idx) select(Number(card.dataset.i)); }
  });
  el.car.addEventListener('pointercancel', () => { pid = null; });
  $('pane-powerups').addEventListener('click', (e) => {
    const b = e.target.closest('[data-up]'); if (!b || !P) return;
    if (P.upgradePower(b.dataset.up)) { renderHeader(); renderPane('powerups'); }
  });
  const saved = P && P.character ? P.character() : null;
  const si = Math.max(0, ROSTER.findIndex((r) => r.id === saved));
  select(si, false);
  setTab('players');
  renderHeader();
  c.events.on('bank', renderHeader);
  c.events.on('death', renderHeader);
}
