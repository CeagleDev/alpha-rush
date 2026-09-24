/**
 * home.js — the HOME screen (UI pass 2): character select carousel, the five tabs, header chips, the
 * LOCATIONS strip, the inline SVG icon set. (index.html owns the CSS.)
 *
 *   ROSTER        the three characters (id, name, title, asset, story, colours, stats). player.js may read
 *                 state.character / state.characterAsset, which main.js writes from selected() before 'start'.
 *   POWER_UI      the five power-ups' names, colours, icons and copy (magnet, omamori, x2, sneakers, surge)
 *   ICON          the icon set (24 x 24 stroke icons; the power-up emblems are filled art) — hud.js reuses it
 *   init(ctx)     builds the carousel, dots, locations and tab bar into #home, restores the saved selection
 *   selected()    the ROSTER entry currently in the middle of the carousel
 *   show() / hide() / refresh()     main.js shows HOME at boot and after quit(); 'start' hides it (hud.js)
 *
 * The active card's art area is covered by `<canvas id="h-turntable">` (in index.html, positioned over the
 * centre card, pointer-events none) that src/showcase.js renders the live hero into; the monogram panel stays
 * BEHIND it as the fallback. The canvas carries data-hero="<id>" and a 'select' event {id, asset} is emitted on
 * every change. Every pane other than PLAYERS is re-rendered from progress.js each time it is opened, so
 * nothing here runs per frame. The stat bars and the HOME TURF / FAVOURITE loadout chips on the cards are
 * presentational flavour only (the runner does not read them).
 */
export const ROSTER = [
  { id: 'ronin', name: 'KAITO', title: 'The Last Ronin', asset: 'hero_ronin', mono: 'K', c1: '#2a2e8c', c2: '#ff2d3a', fg: '#fff', glow: 'rgba(255,45,58,.35)', turf: 'yokocho', fav: 'omamori',
    story: 'A masterless swordsman who sold his armour and kept the blade. He runs the night streets to outpace the debt collectors’ dogs.',
    stats: { speed: 3, jump: 4, luck: 2 } },
  { id: 'kitsune', name: 'YUZU', title: 'Shrine Courier', asset: 'hero_kitsune', mono: 'Y', c1: '#efe9f4', c2: '#ff4a1c', fg: '#1a1020', glow: 'rgba(255,74,28,.35)', turf: 'torii', fav: 'magnet',
    story: 'A fox-spirit messenger who carries talismans between shrines. The pack is hunting the bells on her belt.',
    stats: { speed: 4, jump: 3, luck: 4 } },
  { id: 'oni', name: 'RAIDEN', title: 'Neon Oni', asset: 'hero_oni', mono: 'R', c1: '#ff7a1a', c2: '#22e8ff', fg: '#1a0e00', glow: 'rgba(34,232,255,.4)', turf: 'rooftops', fav: 'sneakers',
    story: 'A rooftop mechanic who built his own jet-boots and stole the wrong scooter. Now every dog in the ward wants him.',
    stats: { speed: 5, jump: 5, luck: 1 } },
];
const STAT_KEYS = [['speed', 'Speed', 'speed'], ['jump', 'Jump', 'jump'], ['luck', 'Luck', 'luck']];

// ---------------------------------------------------------------- icons (inline SVG, no images)
const S = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true"${extra}>${d}</svg>`;
export const ICON = {
  // tabs / headers
  trophy: S('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v3M8 20h8M10 17h4v3h-4z"/>'),
  player: S('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'),
  flag: S('<path d="M5 21V4M5 4h13l-2.5 4L18 12H5"/>'),
  tasks: S('<path d="M4 6l2 2 3-3M4 12l2 2 3-3M4 18l2 2 3-3M12 6h8M12 12h8M12 18h8"/>'),
  bolt: S('<path d="M13 2L5 13h6l-1 9 9-12h-6z"/>'),
  // missions / tasks / achievements
  coins: S('<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 10v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4M5 14v4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-4"/>'),
  tau: S('<path fill="currentColor" stroke="none" d="M3.5 4.5h17v3.4h-6.2v8.1c0 1.5.8 2.3 2.3 2.3h2.6v3.2h-3.4c-3.4 0-5.3-1.9-5.3-5.3V7.9H3.5z"/>'),
  star: S('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  jump: S('<circle cx="12" cy="4.5" r="2"/><path d="M8 11l4-3 4 3-2 4 2 5M12 8v4l-3 3M3 21h18"/><path d="M15 3l3-2M18 6l3-1"/>'),
  slide: S('<path d="M3 21h18M4 16l5-4 4 2 5-3"/><circle cx="19" cy="7" r="2"/><path d="M4 8h10" stroke-dasharray="2 2"/>'),
  shield: S('<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'),
  road: S('<path d="M8 21l2-18h4l2 18M12 4v3M12 10v3M12 16v3"/>'),
  sun: S('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  trio: S('<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M2 19c0-3 2-5 5-5M22 19c0-3-2-5-5-5M7 21c0-3 2-5 5-5s5 2 5 5"/>'),
  repeat: S('<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5"/>'),
  play: S('<path d="M6 3l14 9-14 9z"/>'),
  x5: S('<text x="12" y="17" text-anchor="middle" font-size="14" font-weight="900" font-style="italic" fill="currentColor" stroke="none">x5</text>'),
  n500: S('<text x="12" y="16" text-anchor="middle" font-size="11" font-weight="900" font-style="italic" fill="currentColor" stroke="none">500</text>'),
  n1k: S('<text x="12" y="16" text-anchor="middle" font-size="12" font-weight="900" font-style="italic" fill="currentColor" stroke="none">1K</text>'),
  n2k: S('<text x="12" y="16" text-anchor="middle" font-size="12" font-weight="900" font-style="italic" fill="currentColor" stroke="none">2K</text>'),
  heart: S('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M8 11h2l1-2 2 4 1-2h2"/>'),
  lock: S('<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  // locations
  lantern: S('<path d="M9 4h6M12 2v2M8 6h8l1 3v6l-1 3H8l-1-3V9zM12 18v3M9 21h6"/><path d="M7 11h10M7 14h10"/>'),
  expressway: S('<path d="M3 20L9 4h6l6 16M7 20l3-8M17 20l-3-8M12 9v2M12 14v2M12 19v1M2 8h4M18 8h4"/>'),
  market: S('<path d="M3 9l2-5h14l2 5M3 9v11h18V9M3 9h18M8 20v-6h8v6M13 12c1 0 2 1 2 2"/><path d="M5 9c0 1.5 1.3 2.5 3 2.5S11 10.5 11 9c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5c0 1.5 1.3 2.5 3 2.5"/>'),
  rooftops: S('<path d="M2 21h20M4 21V11l4-3v13M8 21V5h6v16M14 21v-9l5-2v11"/><path d="M10 8h2M10 12h2M10 16h2M17 14v2"/>'),
  torii: S('<path d="M3 6c3-1 15-1 18 0M4 10h16M6 6v15M18 6v15M12 6v4"/>'),
  unknown: S('<path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4v.5"/><circle cx="12" cy="18" r=".6"/><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/>'),
  // stat labels
  speed: S('<path d="M3 12h9M6 7h9M5 17h7M15 12l4-4v8z"/>'),
  luck: S('<path d="M12 21c-4-3-8-6-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5-4 8-8 11z"/>'),
  dog: S('<path fill="currentColor" stroke="none" d="M4 11c1-2 2-4 4-5l1-3 3 2h3c2 0 4 1 5 3l1 1-1 1h-2l-1 2v3l1 5h-2l-1-4h-4l-1 4H8l-1-4c-2 0-3-1-3-3z"/>'),
  // the five power-up emblems: unique, filled, coloured art
  pw_magnet: S('<path d="M6 3h5v9a1 1 0 0 0 2 0V3h5v9a6 6 0 0 1-12 0z" fill="#ff5a4a" stroke="#ffb0a8" stroke-width="1.2"/><rect x="6" y="3" width="5" height="4.5" fill="#e8f0ff"/><rect x="13" y="3" width="5" height="4.5" fill="#e8f0ff"/><path d="M4.5 9.5l-2-1.5M19.5 9.5l2-1.5M4 6.5H2M20 6.5h2" stroke="#ffd24a" stroke-width="1.6" stroke-linecap="round"/>'),
  pw_charm: S('<path d="M8 8h8l1.5 12H6.5z" fill="#7fd4ff" stroke="#cfefff" stroke-width="1.1"/><path d="M8 8l4-3 4 3" fill="#4ab3f0"/><path d="M12 5l-3-2.5M12 5l3-2.5" stroke="#ff2d95" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="5" r="1.4" fill="#ff2d95"/><path d="M10 12h4M10 15h4M10 18h4" stroke="#0b1020" stroke-width="1.3" stroke-linecap="round"/><path d="M9.5 20.5v1.5M14.5 20.5v1.5" stroke="#ff2d95" stroke-width="1.6" stroke-linecap="round"/>'),
  pw_x2: S('<path d="M12 1.5l2.6 2.5 3.5-.6.9 3.5 3.2 1.6-1.6 3.2 1.6 3.2-3.2 1.6-.9 3.5-3.5-.6-2.6 2.5-2.6-2.5-3.5.6-.9-3.5-3.2-1.6 1.6-3.2-1.6-3.2 3.2-1.6.9-3.5 3.5.6z" fill="#ffb300" stroke="#ffe08a" stroke-width="1"/><text x="12" y="16.2" text-anchor="middle" font-size="11.5" font-weight="900" font-style="italic" fill="#1a1200" stroke="none">x2</text>'),
  pw_sneak: S('<path d="M3 17c0-1 1-2 3-2l3-4 3 1 3-1c2 0 5 2 6 3v3H3z" fill="#5af0d0" stroke="#c9fff2" stroke-width="1"/><path d="M3 17h18v1.5H3z" fill="#0b1020"/><path d="M9 11l1.5 1.5M11 10l1.5 1.5" stroke="#0b1020" stroke-width="1.2" stroke-linecap="round"/><path d="M7 10L2 5l5 .5 1-3 2 4z" fill="#e8f0ff" stroke="#5af0d0" stroke-width=".8"/><path d="M13 12l2 2" stroke="#ff2d95" stroke-width="1.4" stroke-linecap="round"/>'),
  pw_surge: S('<circle cx="12" cy="12" r="10.5" fill="#1a1e2a" stroke="#ffd24a" stroke-width="1.2"/><text x="10.6" y="17.5" text-anchor="middle" font-size="16" font-weight="900" font-style="italic" fill="#ffd24a" stroke="none">α</text><path d="M15.5 3l-4 8h3.5l-2.5 9 6.5-11h-3.5l2-6z" fill="#22e8ff" stroke="#bff8ff" stroke-width=".8"/>'),
};
const TABS = [['achievements', 'Achievements', 'trophy'], ['players', 'Players', 'player'], ['missions', 'Missions', 'flag'], ['tasks', 'Tasks', 'tasks'], ['powerups', 'Power-ups', 'bolt']];
export const POWER_UI = {
  magnet:   { name: 'Magnet',      icon: 'pw_magnet', color: '#ff5a4a', dur: 10, key: 'magnetT', desc: 'Pulls every Alpha from all three lanes straight to you.' },
  omamori:  { name: 'Charm',       icon: 'pw_charm',  color: '#7fd4ff', dur: 20, key: 'shieldT', desc: 'A protective omamori. Absorbs one crash, then it is spent.' },
  x2:       { name: 'x2 Score',    icon: 'pw_x2',     color: '#ffb300', dur: 12, key: 'x2T',     desc: 'Doubles the score multiplier while it lasts.' },
  sneakers: { name: 'Super Jump',  icon: 'pw_sneak',  color: '#5af0d0', dur: 10, key: 'sneakT',  desc: 'Winged sneakers. Jumps reach 1.75 m instead of 1.1 m.' },
  surge:    { name: 'Alpha Surge', icon: 'pw_surge',  color: '#22e8ff', dur: 8,  key: 'surgeT',  desc: 'Become unstoppable: fly above the street, smash through everything, pull in every Alpha.' },
};
const MISSION_ICON = { coin: 'coins', dist: 'flag', score: 'star', jump: 'jump', roll: 'slide', powerup: 'bolt', clean: 'shield', runs: 'repeat' };
const ACH_ICON = { first: 'play', m500: 'n500', km1: 'n1k', km2: 'n2k', c100: 'tau', c1000: 'coins', p10: 'bolt', stumble: 'heart', x5: 'x5', trio: 'trio', runs5: 'repeat', daybreak: 'sun' };
const LOCATIONS = [['yokocho', 'Yokocho', 'lantern'], ['expressway', 'Expressway', 'expressway'], ['day', 'Morning Market', 'market'], ['rooftops', 'Rooftops', 'rooftops']];
// the shrine path is the location a run has to EARN (track.js: never on the first lap, from 1,020 m on)
const HIDDEN_LOC = { id: 'torii', at: '1,020 m', icon: 'torii' };

let ctx = null, P = null, idx = 0, tab = 'players', el = {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => (n | 0).toLocaleString('en-US');
const card = (cls, inner, style = '') => `<div class="pc ${cls}"${style ? ` style="${style}"` : ''}><div class="pe"><div class="pi">${inner}</div></div></div>`;
const pct = (have, goal) => Math.round(100 * Math.min(1, goal ? have / goal : 0));
const bar = (have, goal) => `<div class="bar"><b data-w="${pct(have, goal)}" style="width:0"></b></div>`;
const alpha = (n) => `${ICON.tau}${fmt(n)} ALPHA`;

export function selected() { return ROSTER[idx]; }
/** Select by roster id (tools and tests; the tab bar uses the carousel). */
export function choose(id) { const i = ROSTER.findIndex((r) => r.id === id); if (i >= 0) select(i); return i >= 0; }

function cardHtml(r, i) {
  const segs = (n) => Array.from({ length: 5 }, (_, k) => `<b${k < n ? ' class="on"' : ''}></b>`).join('');
  const inner = `<div class="art"><div class="ring"></div><div class="floor"></div><div class="idx d" style="color:var(--fg)">runner<b>0${i + 1}</b></div><div class="mono d">${r.mono}</div><div class="tag d">${esc(r.id)}</div></div>
    <div class="info"><div class="name d">${esc(r.name)}</div><div class="title">${esc(r.title)}</div><p class="story">${esc(r.story)}</p>
    <div class="stats">${STAT_KEYS.map(([k, l, ic]) => `<div class="st"><i>${ICON[ic]}${l}</i><div class="segs">${segs(r.stats[k])}</div></div>`).join('')}</div>
    <div class="loadout"><div>${ICON[(LOCATIONS.find((l) => l[0] === r.turf) || LOCATIONS[0])[2]]}<span><i>home turf</i><b>${esc((LOCATIONS.find((l) => l[0] === r.turf) || LOCATIONS[0])[1])}</b></span></div><div>${ICON[POWER_UI[r.fav].icon].replace('<svg ', '<svg class="pw" ')}<span><i>favourite</i><b>${esc(POWER_UI[r.fav].name)}</b></span></div></div></div>`;
  return card('card', inner, `--c1:${r.c1};--c2:${r.c2};--fg:${r.fg};--cg:${r.glow}`).replace('class="pc card"', `class="pc card" data-i="${i}"`);
}

function select(i, persist = true) {
  idx = (i + ROSTER.length) % ROSTER.length;
  const r = ROSTER[idx];
  el.track.style.transform = `translateX(calc(6% - ${idx * 88}%))`;   // cards are 86% + 1% margins each side
  [...el.track.children].forEach((c, k) => c.classList.toggle('on', k === idx));
  [...el.dots.children].forEach((c, k) => c.classList.toggle('on', k === idx));
  if (el.who) el.who.textContent = `${idx + 1} / ${ROSTER.length}`;
  if (el.tt) { el.tt.dataset.hero = r.id; el.tt.dataset.asset = r.asset; }
  if (ctx) { ctx.state.character = r.id; ctx.state.characterAsset = r.asset; }
  if (persist && P && P.setCharacter) P.setCharacter(r.id);
  if (ctx && ctx.events) ctx.events.emit('select', { id: r.id, asset: r.asset });
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
  if (el.best && sum) el.best.textContent = fmt(sum.best);
  if (el.bank) el.bank.textContent = fmt(P.bank ? P.bank() : 0);
}

/** The LOCATIONS strip under the carousel: five known tiles, one hidden until progress.revealed() has it. */
function renderLocs() {
  if (!el.locs) return;
  const rev = P && P.revealed ? P.revealed() : [];
  const has = rev.includes(HIDDEN_LOC.id);
  const name = has && P.revealName ? P.revealName(HIDDEN_LOC.id) : '';
  el.locs.innerHTML = LOCATIONS.map(([, n, ic]) => `<div class="loc">${ICON[ic]}<span>${esc(n)}</span></div>`).join('') +
    (has ? `<div class="loc new">${ICON.expressway}<span>${esc(name || HIDDEN_LOC.id)}</span><small>new</small></div>`
         : `<div class="loc lock">${ICON.lock}<span>???</span><small>at ${HIDDEN_LOC.at}</small></div>`);
}

/** After a pane renders, let the bars grow from 0 to their value (a CSS width transition). */
function animateBars(pane) {
  const bars = pane.querySelectorAll('.bar b[data-w]');
  requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach((b) => { b.style.width = b.dataset.w + '%'; })));
}

function renderPane(id) {
  if (!P || id === 'players') return;
  const pane = $('pane-' + id); if (!pane) return;
  if (id === 'missions') {
    const s = P.summary(), next = P.nextMissions ? P.nextMissions() : [], done = s.missions.filter((m) => m.done).length;
    pane.innerHTML = `<div class="phead"><b>${ICON.flag}Missions</b><em>set ${s.set + 1} · ${done} / 3 done</em></div>
      <div class="mhead"><div class="mbadgew"><div class="mbadge d">x${s.mult}</div></div>
        <div class="mstat"><div class="set"><b>${s.set + 1}</b>current set</div><div><b>${s.set}</b>sets done</div><div><b>${s.runs | 0}</b>runs</div><div><b>${done}/3</b>this set</div></div></div>` +
      s.missions.map((m) => card('s row' + (m.done ? ' done' : ''), `<div class="ico">${ICON[MISSION_ICON[m.id]] || ICON.flag}</div><div class="body"><div class="rt"><span>${esc(m.text)}</span><em>${m.done ? 'DONE' : `${fmt(m.have)} / ${fmt(m.goal)}`}</em></div>${bar(m.have, m.goal)}<div class="desc">${m.cum ? 'Carries across runs.' : 'In one run.'}${m.done ? ' Complete.' : ` ${pct(m.have, m.goal)} % there.`}</div></div>`)).join('') +
      `<div class="reward">${ICON.trophy}<span>Complete all three &rarr; multiplier <b>x${Math.min(30, s.mult + 1)}</b> for good</span></div>
      <div class="ladder">${Array.from({ length: 6 }, (_, i) => { const m = Math.max(1, s.mult - 1) + i; const cls = m < s.mult ? 'past' : m === s.mult ? 'now' : m === s.mult + 1 ? 'next' : ''; return `<div class="${cls}">x${m}<small>${m < s.mult ? 'done' : m === s.mult ? 'now' : m === s.mult + 1 ? 'next' : `set ${m}`}</small></div>`; }).join('')}</div>
      <div class="nextset"><div class="nh">Next set preview · set ${s.set + 2}</div><div class="nl">${next.map((m) => `<div>${ICON[MISSION_ICON[m.id]] || ICON.flag}<span>${esc(m.text)}</span></div>`).join('')}</div></div>`;
    animateBars(pane);
  } else if (id === 'tasks') {
    const d = P.daily(), done = d.filter((t) => t.done).length, pot = d.reduce((a, t) => a + t.pay, 0), earned = d.filter((t) => t.done).reduce((a, t) => a + t.pay, 0);
    const now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0); const left = Math.max(0, mid - now), hh = Math.floor(left / 3.6e6), mm = Math.floor((left % 3.6e6) / 6e4);
    const tomorrow = P.dailyPreview ? P.dailyPreview() : [];
    const DESC = { coin: 'Every Alpha you grab today counts, across every run.', roll: 'Slides add up across runs today.', powerup: 'Any pickup counts. Magnet, Charm, x2, Super Jump, Surge.', jump: 'Jumps add up across runs today.', dist: 'Metres from every run today, added together.', runs: 'A run counts when the pack catches you.', score: 'Best single run of the day.' };
    pane.innerHTML = `<div class="phead"><b>${ICON.tasks}Daily tasks</b><em>${done} / 3 done</em></div>
      <div class="mstat" style="margin-bottom:12px;grid-template-columns:1fr 1fr 1fr"><div class="set"><b>${hh}h ${String(mm).padStart(2, '0')}m</b>until reset</div><div><b style="color:var(--gold)">${fmt(pot)}</b>today's pot</div><div><b style="color:var(--gold)">${fmt(earned)}</b>earned</div></div>` +
      d.map((t) => card('s row' + (t.done ? ' done' : ''), `<div class="ico">${ICON[MISSION_ICON[t.id]] || ICON.tasks}</div><div class="body"><div class="rt"><span>${esc(t.text)}</span><em>${t.done ? 'PAID' : `${fmt(t.have)} / ${fmt(t.goal)}`}</em></div>${bar(t.have, t.goal)}<div class="desc">${DESC[t.id] || ''}</div><div class="pay${t.done ? ' paid' : ''}">${ICON.tau}${t.done ? 'paid' : 'reward'} +${t.pay} Alpha</div></div>`)).join('') +
      `<div class="reward" style="background:linear-gradient(90deg,rgba(255,210,74,.22),rgba(34,232,255,.1));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 0 1px rgba(255,210,74,.4)">${ICON.coins.replace('<svg ', '<svg style="stroke:var(--gold);filter:drop-shadow(0 0 4px rgba(255,210,74,.7))" ')}<span>Rewards go <b style="color:var(--gold);text-shadow:0 0 10px rgba(255,210,74,.6)">straight to the bank</b> the moment a task completes</span></div>
      <div class="nextset"><div class="nh">Tomorrow's tasks</div><div class="nl">${tomorrow.map((m) => `<div>${ICON[MISSION_ICON[m.id]] || ICON.tasks}<span>${esc(m.text)}</span></div>`).join('')}</div></div>`;
    animateBars(pane);
  } else if (id === 'achievements') {
    const a = P.achievements(), n = a.filter((x) => x.unlocked).length, pay = P.ACH_PAY || 100;
    pane.innerHTML = `<div class="phead"><b>${ICON.trophy}Achievements</b><em>${n} / ${a.length} unlocked</em></div><div class="grid">` +
      a.map((x) => card('s badge' + (x.unlocked ? ' un' : ''), `${ICON.lock.replace('<svg ', '<svg class="lock" ')}<div class="hex">${ICON[ACH_ICON[x.id]] || esc(x.tag)}</div><div class="bn">${esc(x.name)}</div><div class="bd">${esc(x.desc)}</div><div class="rw">${ICON.tau}${x.unlocked ? 'paid' : '+' + pay}</div>`)).join('') + '</div>';
  } else if (id === 'powerups') {
    const lv = P.powerLevels(), bank = P.bank(), T = (ctx.modules.powerups && ctx.modules.powerups.TYPES) || {};
    pane.innerHTML = `<div class="phead"><b>${ICON.bolt}Power-ups</b><em class="bankline">${ICON.tau}bank ${fmt(bank)}</em></div>` + Object.keys(POWER_UI).map((k) => {
      const u = POWER_UI[k], n = Math.max(1, lv[k] | 0), max = n >= 5, cost = P.powerCost(k), base = (T[k] && T[k].dur) || u.dur;
      const dur = (l) => (base * (1 + 0.2 * (l - 1))).toFixed(1).replace(/\.0$/, '');
      const pips = Array.from({ length: 5 }, (_, i) => `<b${i < n ? ' class="on"' : ''}></b>`).join('');
      const can = !max && bank >= cost;
      return card('pw', `<div class="pico"><div class="lvl">LV ${n}</div>${ICON[u.icon]}</div><div class="body">
        <div class="rt"><span>${u.name}</span><em>${dur(n)} s${max ? '' : `<small>&rarr; ${dur(n + 1)} s</small>`}</em></div>
        <div class="desc">${u.desc}</div>
        <div class="foot"><div class="lv">level ${n}${max ? ' · max' : ` of 5`}<div class="pips">${pips}</div></div>
        <button class="up${max ? ' max' : ''}" type="button" data-up="${k}" ${can ? '' : 'disabled'}>${max ? 'MAX' : `Upgrade<small>${ICON.tau}${fmt(cost)} Alpha</small>`}</button></div></div>`, `--pc:${u.color}`);
    }).join('');
  }
}

export function refresh() { renderHeader(); renderLocs(); renderPane(tab); }
export function show() { refresh(); const h = $('home'); if (h) h.classList.add('on'); }
export function hide() { const h = $('home'); if (h) h.classList.remove('on'); }

export async function init(c) {
  ctx = c; P = c.modules && c.modules.progress;
  el = { track: $('h-track'), dots: $('h-dots'), tabs: $('h-tabs'), best: $('h-best'), bank: $('h-bank'), who: $('h-who'), car: $('h-car'), locs: $('h-locs'), tt: $('h-turntable') };
  if (!el.track) return;
  el.track.innerHTML = ROSTER.map(cardHtml).join('');
  el.dots.innerHTML = ROSTER.map(() => '<i></i>').join('');
  el.tabs.innerHTML = TABS.map(([id, label, ic]) => `<button class="tab" type="button" data-tab="${id}">${ICON[ic]}<span>${label}</span></button>`).join('');
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
  renderHeader(); renderLocs();
  c.events.on('bank', renderHeader);
  c.events.on('death', renderHeader);
  c.events.on('reveal', renderLocs);
}
