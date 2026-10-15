/* 運動管理アプリ */
(() => {
  'use strict';

  const APP_VERSION = '1.1.0';
  const KEY = 'undo-kanri:v1';
  const SW_KEY = 'undo-kanri:stopwatch';
  const WD = ['日', '月', '火', '水', '木', '金', '土'];
  const PALETTE = [
    ['#6BC08F', 'グリーン'], ['#EB8F66', 'オレンジ'], ['#B39AE0', 'パープル'], ['#6AAEE0', 'ブルー'],
    ['#D9B85A', 'イエロー'], ['#F07FB0', 'ピンク'], ['#5FC7C0', 'ティール'], ['#E88080', 'レッド']
  ];
  const DEFAULT_TYPES = [
    { id: 'run', name: 'ランニング', color: '#6BC08F' },
    { id: 'gym', name: '筋トレ', color: '#EB8F66' },
    { id: 'yoga', name: 'ヨガ', color: '#B39AE0' },
    { id: 'swim', name: '水泳', color: '#6AAEE0' },
    { id: 'walk', name: 'ウォーキング', color: '#D9B85A' }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const ICON = {
    left: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    cal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    gear: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    edit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
    watch: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5"/></svg>',
    play: '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    reset: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg>',
    check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  /* ---------------- 保存 ---------------- */
  const isHex = (c) => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);
  function freshDb() {
    return { version: 1, types: DEFAULT_TYPES.map((t) => ({ ...t, archived: false })), records: [] };
  }
  function isValidDb(d) {
    return d && Array.isArray(d.types) && Array.isArray(d.records) &&
      d.types.every((t) => t && typeof t.id === 'string' && typeof t.name === 'string' && isHex(t.color)) &&
      d.records.every((r) => r && typeof r.id === 'string' && typeof r.typeId === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
  }
  // 記録の値をきれいにする（時間は秒、集中度は -10〜+10 の整数）
  const cleanDuration = (v) => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.round(v) : null);
  const cleanFocus = (v) => (typeof v === 'number' && isFinite(v) ? Math.max(-10, Math.min(10, Math.round(v))) : null);
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (isValidDb(d)) return d;
      }
    } catch (e) { /* 読めなければ初期状態 */ }
    return freshDb();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (e) { toast('保存できませんでした'); return false; }
  }
  let db = load();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  /* ---------------- 日付 ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`; // m は 0 始まり
  const toYmd = (dt) => ymd(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const todayStr = () => toYmd(new Date());
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const diffDays = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
  const shiftMonth = (y, m, k) => { const d = new Date(y, m + k, 1); return [d.getFullYear(), d.getMonth()]; };
  const monthRange = (y, m) => [ymd(y, m, 1), ymd(y, m, daysInMonth(y, m))];
  const yearRange = (y) => [`${y}-01-01`, `${y}-12-31`];
  const fmtLong = (s) => { const d = parseYmd(s); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`; };
  const fmtMD = (s) => { const d = parseYmd(s); return `${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`; };
  const fmtShort = (s) => { const d = parseYmd(s); const y = d.getFullYear() !== new Date().getFullYear() ? `${d.getFullYear()}/` : ''; return `${y}${d.getMonth() + 1}/${d.getDate()}（${WD[d.getDay()]}）`; };

  /* ---------------- 集計 ---------------- */
  const activeTypes = () => db.types.filter((t) => !t.archived);
  const typeById = (id) => db.types.find((t) => t.id === id) || { id, name: '（不明な種目）', color: '#8A857B', archived: true };
  const tint = (c) => c + '2E';
  const recordsOn = (date) => db.records.filter((r) => r.date === date).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  function dayCount(from, to) {
    const s = new Set();
    for (const r of db.records) if (r.date >= from && r.date <= to) s.add(r.date);
    return s.size;
  }
  function elapsedDays(from, to) {
    const t = todayStr();
    const end = to < t ? to : t;
    return end < from ? 0 : diffDays(from, end) + 1;
  }
  function intervalOf(from, to) {
    const c = dayCount(from, to);
    const e = elapsedDays(from, to);
    return c && e ? (e / c).toFixed(1) : '—';
  }
  function diffText(n) { return n > 0 ? `+${n}回` : n < 0 ? `${n}回` : '±0回'; }

  /* ---------------- 時間・集中度の表示 ---------------- */
  function fmtDur(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
    if (h) return `${h}時間${m}分`;
    if (m) return s ? `${m}分${s}秒` : `${m}分`;
    return `${s}秒`;
  }
  const signed = (v) => (v > 0 ? `+${v}` : String(v));
  const focusClass = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero');
  function recMeta(r) {
    const parts = [];
    if (r.durationSec) parts.push(fmtDur(r.durationSec));
    if (typeof r.focus === 'number') parts.push(`集中度 ${signed(r.focus)}`);
    if (r.memo) parts.push(r.memo);
    return parts.length ? parts.join(' · ') : 'メモなし';
  }

  /* ---------------- ストップウォッチ ---------------- */
  // 開始時刻を保存するので、アプリを閉じても計測は続く
  function loadSw() {
    try {
      const s = JSON.parse(localStorage.getItem(SW_KEY) || 'null');
      if (s && typeof s.base === 'number' && typeof s.startedAt === 'number') return { running: !!s.running, base: s.base, startedAt: s.startedAt };
    } catch (e) { /* 初期状態へ */ }
    return { running: false, base: 0, startedAt: 0 };
  }
  let sw = loadSw();
  const saveSw = () => { try { localStorage.setItem(SW_KEY, JSON.stringify(sw)); } catch (e) { /* 無視 */ } };
  const swMs = () => Math.max(0, sw.base + (sw.running ? Date.now() - sw.startedAt : 0));
  function swStart() { if (sw.running) return; sw.running = true; sw.startedAt = Date.now(); saveSw(); wakeLock(true); }
  function swPause() { if (!sw.running) return; sw.base = swMs(); sw.running = false; sw.startedAt = 0; saveSw(); wakeLock(false); }
  function swReset() { sw = { running: false, base: 0, startedAt: 0 }; saveSw(); wakeLock(false); }

  // 計測中は画面が消えないようにする（対応している端末のみ）
  let lock = null;
  async function wakeLock(on) {
    try {
      if (on && 'wakeLock' in navigator && !lock && document.visibilityState === 'visible') {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      } else if (!on && lock) { await lock.release(); lock = null; }
    } catch (e) { lock = null; }
  }

  /* ---------------- 状態 ---------------- */
  const t0 = new Date();
  const state = {
    tab: 'calendar',
    calY: t0.getFullYear(), calM: t0.getMonth(), sel: todayStr(),
    anaView: 'month', anaYear: t0.getFullYear(),
    sheet: null,           // 'record' | 'settings'
    form: null,            // { id, date, typeId, memo, durationSec, focus, fromStopwatch }
    editTypes: false, addingType: false, newName: '', newColor: PALETTE[5][0]
  };

  /* ---------------- カレンダー ---------------- */
  function renderCalendar() {
    const { calY: y, calM: m } = state;
    const today = todayStr();
    const td = parseYmd(today);
    const isCur = td.getFullYear() === y && td.getMonth() === m;
    const [from, to] = monthRange(y, m);
    const [py, pm] = shiftMonth(y, m, -1);
    const [pf, pt] = monthRange(py, pm);
    const count = dayCount(from, to);
    const prevCount = dayCount(pf, pt);

    const byDate = {};
    for (const r of db.records) if (r.date >= from && r.date <= to) (byDate[r.date] = byDate[r.date] || []).push(r);

    const lead = new Date(y, m, 1).getDay();
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<div></div>';
    const n = daysInMonth(y, m);
    for (let d = 1; d <= n; d++) {
      const date = ymd(y, m, d);
      const w = (lead + d - 1) % 7;
      const recs = byDate[date] || [];
      const ids = [...new Set(recs.map((r) => r.typeId))];
      const cls = ['day'];
      if (w === 0) cls.push('sun');
      if (w === 6) cls.push('sat');
      if (date > today) cls.push('future');
      if (date === today) cls.push('today');
      if (date === state.sel) cls.push('sel');
      const names = ids.map((id) => typeById(id).name).join('、');
      cells += `<button class="${cls.join(' ')}" data-action="pick-day" data-date="${date}" aria-label="${m + 1}月${d}日 ${esc(names || '記録なし')}"${date === state.sel ? ' aria-pressed="true"' : ''}>` +
        `<span class="d">${d}</span><span class="dots">${ids.slice(0, 3).map((id) => `<i style="--c:${typeById(id).color}"></i>`).join('')}</span></button>`;
    }

    const legend = activeTypes().map((t) => `<span><i style="--c:${t.color}"></i>${esc(t.name)}</span>`).join('');

    const sel = state.sel;
    const selRecs = recordsOn(sel);
    const selItems = selRecs.map((r) => {
      const t = typeById(r.typeId);
      return `<button class="rec" data-action="edit-record" data-id="${r.id}" aria-label="${esc(t.name)}の記録を編集">` +
        `<span class="badge" style="--c:${t.color};--bg-c:${tint(t.color)}"><i></i></span>` +
        `<span class="txt"><span class="name">${esc(t.name)}</span><span class="memo">${esc(recMeta(r))}</span></span>${ICON.edit}</button>`;
    }).join('');

    $('#view-calendar').innerHTML = `
      <header class="page-head">
        <div class="page-title"><h1 class="num">${m + 1}月</h1><span class="sub">${y}年</span></div>
        <div class="head-btns">
          ${isCur ? '' : '<button class="pill-btn" data-action="go-today">今日</button>'}
          <button class="icon-btn" data-action="prev-month" aria-label="前の月">${ICON.left}</button>
          <button class="icon-btn" data-action="next-month" aria-label="次の月">${ICON.right}</button>
        </div>
      </header>
      <button class="summary" data-action="tab" data-tab="analysis" aria-label="分析を見る">
        <span class="col"><span class="lbl">${isCur ? '今月' : `${m + 1}月`}の運動</span><span class="val"><b class="num big accent">${count}</b> 回</span></span>
        <span class="col"><span class="lbl">平均</span><span class="val"><b class="num big">${intervalOf(from, to)}</b> 日に1回</span></span>
        <span class="col narrow"><span class="lbl">${isCur ? '先月' : `${pm + 1}月`}</span><span class="val">${prevCount}回</span></span>
        <span style="color:var(--accent-soft)">${ICON.right}</span>
      </button>
      <section class="card cal" id="cal">
        <div class="weekdays"><span class="sun">日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span class="sat">土</span></div>
        <div class="grid">${cells}</div>
      </section>
      <div class="legend">${legend}</div>
      <section class="day-detail">
        <div class="row-between"><h2>${fmtMD(sel)}${sel === today ? ' · 今日' : ''}</h2><span class="muted" style="font-size:13px">${selRecs.length ? selRecs.length + '件' : ''}</span></div>
        ${selItems || '<button class="dashed" data-action="add-record">' + ICON.plus + 'この日の運動を追加</button>'}
      </section>`;
  }

  /* ---------------- ストップウォッチ画面 ---------------- */
  const RING = 816.8; // 2πr (r=130)
  function renderStopwatch() {
    $('#view-stopwatch').innerHTML = `
      <header class="page-head"><div class="page-title"><h1 class="num">ストップウォッチ</h1></div></header>
      <div class="sw-dial">
        <svg viewBox="0 0 290 290" aria-hidden="true">
          <circle cx="145" cy="145" r="130" fill="none" stroke="var(--surface2)" stroke-width="10"/>
          <circle id="sw-ring" cx="145" cy="145" r="130" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${RING}" stroke-dashoffset="${RING}" transform="rotate(-90 145 145)"/>
        </svg>
        <div class="sw-center">
          <span id="sw-clock" class="sw-clock num" role="timer" aria-live="off">00:00:00</span>
          <span id="sw-tenth" class="sw-tenth num">.0</span>
          <span id="sw-status" class="sw-status"></span>
        </div>
      </div>
      <div class="sw-controls">
        <div class="sw-btn"><button class="sw-round" data-action="sw-reset" aria-label="リセット">${ICON.reset}</button><span>リセット</span></div>
        <div class="sw-btn main"><button id="sw-toggle" class="sw-round big" data-action="sw-toggle"></button><span id="sw-toggle-label"></span></div>
        <div class="sw-btn"><button id="sw-record" class="sw-round go" data-action="sw-record" aria-label="この時間で記録する">${ICON.check}</button><span>記録する</span></div>
      </div>
      <p class="muted small center">運動を始めたらスタート。終わったら「記録する」で<br>時間が記録画面に入ります。アプリを閉じても計測は続きます。</p>`;
    tickStopwatch();
  }
  function tickStopwatch() {
    const clock = $('#sw-clock');
    if (!clock) return;
    const ms = swMs();
    const total = Math.floor(ms / 1000);
    clock.textContent = `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
    $('#sw-tenth').textContent = '.' + (Math.floor(ms / 100) % 10);
    $('#sw-ring').setAttribute('stroke-dashoffset', (RING * (1 - (ms % 60000) / 60000)).toFixed(1));
    const st = $('#sw-status');
    st.textContent = sw.running ? '計測中' : ms > 0 ? '一時停止中' : 'スタートを押して計測';
    st.classList.toggle('on', sw.running);
    const label = sw.running ? '一時停止' : ms > 0 ? '再開' : 'スタート';
    const tg = $('#sw-toggle');
    if (tg.dataset.mode !== label) {
      tg.dataset.mode = label;
      tg.innerHTML = sw.running ? ICON.pause : ICON.play;
      tg.setAttribute('aria-label', label);
      $('#sw-toggle-label').textContent = label;
    }
    $('#sw-record').disabled = ms < 1000;
  }
  let swTimer = null;
  function syncTicker() {
    const need = state.tab === 'stopwatch' && sw.running && document.visibilityState === 'visible';
    if (need && !swTimer) swTimer = setInterval(tickStopwatch, 100);
    if (!need && swTimer) { clearInterval(swTimer); swTimer = null; }
  }

  /* ---------------- 分析 ---------------- */
  function renderAnalysis() {
    const today = todayStr();
    const td = parseYmd(today);
    const cy = td.getFullYear(), cm = td.getMonth();
    const isMonth = state.anaView === 'month';
    let body = '';

    if (isMonth) {
      const [f0, t0_] = monthRange(cy, cm);
      const [y1, m1] = shiftMonth(cy, cm, -1);
      const [f1, t1] = monthRange(y1, m1);
      const [y2, m2] = shiftMonth(cy, cm, -2);
      const [f2, t2] = monthRange(y2, m2);
      const c0 = dayCount(f0, t0_), c1 = dayCount(f1, t1), c2 = dayCount(f2, t2);
      const [yf, yt] = yearRange(cy);

      // 月別棒グラフ
      const ay = state.anaYear;
      const counts = [];
      for (let m = 0; m < 12; m++) { const [a, b] = monthRange(ay, m); counts.push(dayCount(a, b)); }
      const max = Math.max(1, ...counts);
      const monthsSoFar = ay < cy ? 12 : ay === cy ? cm + 1 : 0;
      const total = counts.reduce((a, b) => a + b, 0);
      const avg = monthsSoFar ? (total / monthsSoFar).toFixed(1) : '—';
      const firstYear = db.records.reduce((mn, r) => Math.min(mn, +r.date.slice(0, 4)), cy);
      let bars = '', labels = '';
      counts.forEach((v, i) => {
        const future = ay > cy || (ay === cy && i > cm);
        const cls = future ? 'empty' : (ay === cy && i === cm ? 'cur' : '');
        const h = future ? 4 : Math.max(4, Math.round(v / max * 118));
        bars += `<div class="b ${cls}"><span class="v">${future ? '' : v}</span><div class="bar" style="height:${h}px"></div></div>`;
        labels += `<span>${i + 1}</span>`;
      });

      // 種目別（今月）
      const perType = {};
      for (const r of db.records) if (r.date >= f0 && r.date <= t0_) perType[r.typeId] = (perType[r.typeId] || 0) + 1;
      const kindIds = [...new Set([...activeTypes().map((t) => t.id), ...Object.keys(perType)])];
      const kmax = Math.max(1, ...kindIds.map((id) => perType[id] || 0));
      const kinds = kindIds.map((id) => {
        const t = typeById(id); const v = perType[id] || 0;
        return `<div class="hbar-row"><span class="n">${esc(t.name)}</span><div class="track"><div class="fill" style="--c:${t.color};width:${Math.round(v / kmax * 100)}%"></div></div><span class="c">${v}回</span></div>`;
      }).join('');

      body = `
        <div class="kpis">
          <div class="kpi hl"><span class="lbl">今月（${cm + 1}月）</span><span class="val"><b class="num big">${c0}</b> 回</span><span class="foot">先月より ${diffText(c0 - c1)}</span></div>
          <div class="kpi"><span class="lbl">先月（${m1 + 1}月）</span><span class="val"><b class="num big">${c1}</b> 回</span><span class="foot">${m2 + 1}月より ${diffText(c1 - c2)}</span></div>
        </div>
        <section class="card stack">
          <h2>平均すると何日に1回？</h2>
          <div class="gaps">
            <div><span class="lbl">今月</span><span class="val"><b class="num big accent">${intervalOf(f0, t0_)}</b> 日</span></div>
            <div><span class="lbl">先月</span><span class="val"><b class="num big">${intervalOf(f1, t1)}</b> 日</span></div>
            <div><span class="lbl">今年</span><span class="val"><b class="num big">${intervalOf(yf, yt)}</b> 日</span></div>
          </div>
          <p class="muted small">期間の日数 ÷ 運動した日数（今月・今年は今日まで）</p>
        </section>
        <section class="card stack">
          <div class="chart-head">
            <h2>${ay}年 月別回数</h2>
            <div class="year-nav">
              <button data-action="ana-year" data-k="-1" aria-label="前の年" ${ay <= firstYear ? 'disabled' : ''}>${ICON.left}</button>
              <span class="muted" style="font-size:12px">月平均 ${avg}回</span>
              <button data-action="ana-year" data-k="1" aria-label="次の年" ${ay >= cy ? 'disabled' : ''}>${ICON.right}</button>
            </div>
          </div>
          <div class="bars" role="img" aria-label="${ay}年の月別運動回数 ${counts.map((v, i) => `${i + 1}月${v}回`).join('、')}">${bars}</div>
          <div class="bar-labels" aria-hidden="true">${labels}</div>
        </section>
        <section class="card stack">
          <h2>種目別（今月）</h2>
          ${kinds || '<p class="empty-note">種目がありません</p>'}
        </section>`;
    } else {
      const [yf, yt] = yearRange(cy);
      const [lf, lt] = yearRange(cy - 1);
      const firstYear = db.records.reduce((mn, r) => Math.min(mn, +r.date.slice(0, 4)), cy);
      const years = [];
      for (let y = firstYear; y <= cy; y++) {
        const [a, b] = yearRange(y);
        const per = {};
        for (const r of db.records) if (r.date >= a && r.date <= b) per[r.typeId] = (per[r.typeId] || 0) + 1;
        const topId = Object.keys(per).sort((p, q) => per[q] - per[p])[0];
        years.push({ y, c: dayCount(a, b), gap: intervalOf(a, b), top: topId ? typeById(topId).name : '—' });
      }
      const ymax = Math.max(1, ...years.map((x) => x.c));
      const ybars = years.map((x) => `<div class="yrow ${x.y === cy ? 'cur' : ''}"><span class="y">${x.y}</span><div class="track"><div class="fill" style="width:${Math.round(x.c / ymax * 100)}%"></div></div><span class="c">${x.c}</span></div>`).join('');
      const rows = years.slice().reverse().map((x) => `<div class="tr"><span>${x.y}</span><span class="r"><b>${x.c}</b>回</span><span class="r">${x.gap}${x.gap === '—' ? '' : '日'}</span><span class="r ellip">${esc(x.top)}</span></div>`).join('');
      const lc = dayCount(lf, lt);
      body = `
        <div class="kpis">
          <div class="kpi hl"><span class="lbl">今年（${cy}）</span><span class="val"><b class="num big">${dayCount(yf, yt)}</b> 回</span><span class="foot">${td.getMonth() + 1}/${td.getDate()}時点 · ${intervalOf(yf, yt)}日に1回</span></div>
          <div class="kpi"><span class="lbl">昨年（${cy - 1}）</span><span class="val"><b class="num big">${lc}</b> 回</span><span class="foot">${intervalOf(lf, lt)}日に1回</span></div>
        </div>
        <section class="card stack">
          <h2>年ごとの運動回数</h2>
          ${ybars}
        </section>
        <section class="card table">
          <div class="tr th"><span>年</span><span class="r">回数</span><span class="r">平均間隔</span><span class="r">最多種目</span></div>
          ${rows}
        </section>`;
    }

    // 種目別 前回からの日数（いちばん下）
    const lasts = activeTypes().map((t) => {
      let last = null;
      for (const r of db.records) if (r.typeId === t.id && r.date <= today && (!last || r.date > last)) last = r.date;
      if (!last) {
        return `<div class="item"><span class="badge" style="--c:${t.color};--bg-c:${tint(t.color)}"><i></i></span><span class="txt"><span class="name">${esc(t.name)}</span><span class="when">まだ記録がありません</span></span><span class="ago none">—</span></div>`;
      }
      const n = diffDays(last, today);
      return `<div class="item"><span class="badge" style="--c:${t.color};--bg-c:${tint(t.color)}"><i></i></span><span class="txt"><span class="name">${esc(t.name)}</span><span class="when">前回 ${fmtShort(last)}</span></span><span class="ago num ${n >= 7 ? 'warn' : ''}">${n === 0 ? '今日' : n + '日前'}</span></div>`;
    }).join('');

    $('#view-analysis').innerHTML = `
      <header class="page-head">
        <div class="page-title"><h1 class="num">分析</h1></div>
        <button class="icon-btn" data-action="open-settings" aria-label="設定">${ICON.gear}</button>
      </header>
      <div class="seg" role="group" aria-label="表示切替">
        <button data-action="ana-view" data-v="month" aria-pressed="${isMonth}">月別</button>
        <button data-action="ana-view" data-v="year" aria-pressed="${!isMonth}">年別</button>
      </div>
      ${body}
      <section class="card lasts">
        <div class="row-between" style="padding-bottom:6px"><h2>種目別 前回からの日数</h2><span class="muted" style="font-size:12px">${td.getMonth() + 1}/${td.getDate()}時点</span></div>
        ${lasts || '<p class="empty-note">種目がありません</p>'}
      </section>`;
  }

  /* ---------------- 記録シート ---------------- */
  function renderRecordSheet() {
    const f = state.form;
    const editing = !!f.id;
    let types = activeTypes();
    const cur = db.types.find((t) => t.id === f.typeId);
    if (cur && cur.archived) types = [...types, cur];

    const chips = types.map((t) => {
      const on = t.id === f.typeId && !state.editTypes;
      return `<div class="type-wrap">
        <button class="type-chip" data-action="pick-type" data-id="${t.id}" aria-pressed="${on}" style="--c:${t.color};--bg-c:${tint(t.color)}"><span class="dot"></span><span class="tname">${esc(t.name)}</span></button>
        ${state.editTypes && !t.archived ? `<button class="del-badge" data-action="delete-type" data-id="${t.id}" aria-label="${esc(t.name)}を削除">${ICON.minus}</button>` : ''}
      </div>`;
    }).join('');

    const swatches = PALETTE.map(([c, n]) => `<button class="swatch" data-action="pick-color" data-c="${c}" style="--c:${c}" aria-label="${n}" aria-pressed="${state.newColor === c}"></button>`).join('');

    const el = $('#sheet-record');
    el.innerHTML = `
      <div class="sheet-head">
        <button class="icon-btn" data-action="close-sheet" aria-label="閉じる">${ICON.close}</button>
        <h2 id="record-title">${editing ? '記録を編集' : '運動を記録'}</h2>
        <span class="icon-spacer"></span>
      </div>
      <div class="sheet-scroll">
        <div class="field">
          <span class="flabel" id="lbl-date">日付</span>
          <label class="date-btn"><span>${fmtLong(f.date)}</span>${ICON.cal}<input id="f-date" type="date" value="${f.date}" aria-labelledby="lbl-date"></label>
        </div>
        <div class="field ${state.editTypes ? 'editing' : ''}">
          <div class="row-between">
            <span class="flabel">運動の種類</span>
            <button class="pill-btn" data-action="toggle-edit-types">${state.editTypes ? '完了' : '編集'}</button>
          </div>
          <div class="type-grid">
            ${chips}
            <button class="type-chip add" data-action="open-add-type">${ICON.plus}種類を追加</button>
          </div>
          ${state.editTypes ? '<p class="muted small">種類を削除しても、過去の記録は残ります</p>' : ''}
          ${state.addingType ? `
          <div class="add-panel">
            <div class="field" style="gap:6px"><label for="f-newname">種目名</label><input id="f-newname" class="text-input" type="text" maxlength="12" placeholder="例：サイクリング" autocomplete="off"></div>
            <div class="field" style="gap:6px"><span class="lbl">色</span><div class="swatches">${swatches}</div></div>
            <div class="btn-row"><button class="small-btn" data-action="cancel-add-type">キャンセル</button><button class="small-btn go" data-action="confirm-add-type">追加する</button></div>
          </div>` : ''}
        </div>
        <div class="field">
          <span class="flabel">運動時間</span>
          ${durationField(f)}
        </div>
        <div class="field">
          <div class="row-between focus-head">
            <label class="flabel" for="f-focus">集中度</label>
            <output id="f-focus-val" class="focus-val num ${focusClass(f.focus)}" for="f-focus">${signed(f.focus)}</output>
          </div>
          <div class="focus-box">
            <input id="f-focus" class="focus-range ${focusClass(f.focus)}" type="range" min="-10" max="10" step="1" value="${f.focus}" aria-valuetext="${signed(f.focus)}" style="--p:${(f.focus + 10) * 5}%">
            <div class="focus-scale" aria-hidden="true">
              <span class="l"><b>いまいち</b><span>−10</span></span>
              <span class="c">0</span>
              <span class="r"><b>良かった</b><span>+10</span></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="flabel" for="f-memo">メモ（任意）</label>
          <textarea id="f-memo" class="memo" rows="3" maxlength="200" placeholder="距離・部位・感想など"></textarea>
        </div>
        ${editing ? '<button class="danger-link" data-action="delete-record">この記録を削除</button>' : ''}
      </div>
      <div class="sheet-foot"><button class="primary" data-action="save-record">保存する</button></div>`;
    $('#f-memo').value = f.memo || '';
    const nn = $('#f-newname');
    if (nn) nn.value = state.newName;
  }

  function durationField(f) {
    if (f.durationSec) {
      return `<div class="dur-box">
        <span class="dur-ico">${ICON.watch}</span>
        <span class="dur-val">${durHtml(f.durationSec)}</span>
        ${f.fromStopwatch ? '<span class="muted" style="font-size:12px">ストップウォッチ</span>' : ''}
        <button class="dur-clear" data-action="clear-duration" aria-label="運動時間を消す">${ICON.close}</button>
      </div>`;
    }
    const ms = swMs();
    if (!f.id && ms >= 1000) {
      return `<button class="dur-box dur-use" data-action="use-stopwatch"><span class="dur-ico">${ICON.watch}</span><span>ストップウォッチの時間を使う（${fmtDur(Math.round(ms / 1000))}）</span></button>`;
    }
    return '<div class="dur-box dur-none"><span class="dur-ico">' + ICON.watch + '</span><span class="muted" style="font-size:14px">なし（ストップウォッチで計測すると入ります）</span></div>';
  }
  function durHtml(sec) {
    const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
    const n = (v) => `<b class="num">${v}</b>`;
    return h ? `${n(h)} 時間 ${n(m)} 分` : `${n(m)} 分 ${n(s)} 秒`;
  }

  function openRecordSheet(rec, opts = {}) {
    state.form = rec
      ? { id: rec.id, date: rec.date, typeId: rec.typeId, memo: rec.memo || '', durationSec: cleanDuration(rec.durationSec), focus: cleanFocus(rec.focus) ?? 0, fromStopwatch: false }
      : { id: null, date: opts.date || state.sel, typeId: (activeTypes()[0] || {}).id || null, memo: '', durationSec: opts.durationSec || null, focus: 0, fromStopwatch: !!opts.durationSec };
    if (!rec && state.lastTypeId && activeTypes().some((t) => t.id === state.lastTypeId)) state.form.typeId = state.lastTypeId;
    state.editTypes = false; state.addingType = false; state.newName = '';
    renderRecordSheet();
    openSheet('record');
  }

  /* ---------------- シート開閉 ---------------- */
  function openSheet(name) {
    state.sheet = name;
    const el = $('#sheet-' + name);
    el.hidden = false;
    document.documentElement.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
    const first = el.querySelector('.sheet-head .icon-btn');
    if (first) first.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (!state.sheet) return;
    const el = $('#sheet-' + state.sheet);
    el.classList.remove('open');
    const done = () => { el.hidden = true; };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) done(); else setTimeout(done, 300);
    document.documentElement.classList.remove('lock');
    state.sheet = null;
  }

  /* ---------------- 全体描画 ---------------- */
  function render() {
    const tab = state.tab;
    $('#view-calendar').hidden = tab !== 'calendar';
    $('#view-stopwatch').hidden = tab !== 'stopwatch';
    $('#view-analysis').hidden = tab !== 'analysis';
    $('#fab').hidden = tab !== 'calendar';
    document.querySelectorAll('.tab').forEach((b) => {
      if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (tab === 'calendar') renderCalendar();
    else if (tab === 'stopwatch') renderStopwatch();
    else renderAnalysis();
    syncTicker();
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function moveMonth(k) {
    [state.calY, state.calM] = shiftMonth(state.calY, state.calM, k);
    const today = todayStr();
    const td = parseYmd(today);
    state.sel = td.getFullYear() === state.calY && td.getMonth() === state.calM ? today : ymd(state.calY, state.calM, 1);
    renderCalendar();
  }

  /* ---------------- 操作 ---------------- */
  const actions = {
    'tab': (b) => { state.tab = b.dataset.tab; window.scrollTo(0, 0); render(); },
    'prev-month': () => moveMonth(-1),
    'next-month': () => moveMonth(1),
    'go-today': () => { const d = new Date(); state.calY = d.getFullYear(); state.calM = d.getMonth(); state.sel = todayStr(); renderCalendar(); },
    'pick-day': (b) => { state.sel = b.dataset.date; renderCalendar(); },
    'add-record': () => openRecordSheet(null),
    'edit-record': (b) => { const r = db.records.find((x) => x.id === b.dataset.id); if (r) openRecordSheet(r); },
    'close-sheet': () => closeSheet(),
    'pick-type': (b) => { if (state.editTypes) return; state.form.typeId = b.dataset.id; renderRecordSheet(); },
    'toggle-edit-types': () => { state.editTypes = !state.editTypes; state.addingType = false; renderRecordSheet(); },
    'open-add-type': () => {
      state.addingType = true; state.editTypes = false; state.newName = '';
      const used = new Set(activeTypes().map((t) => t.color));
      state.newColor = (PALETTE.find(([c]) => !used.has(c)) || PALETTE[0])[0];
      renderRecordSheet();
      const nn = $('#f-newname'); if (nn) nn.focus();
    },
    'cancel-add-type': () => { state.addingType = false; state.newName = ''; renderRecordSheet(); },
    'pick-color': (b) => { state.newColor = b.dataset.c; renderRecordSheet(); },
    'confirm-add-type': () => {
      const name = state.newName.trim();
      if (!name) { toast('種目名を入れてください'); const nn = $('#f-newname'); if (nn) nn.focus(); return; }
      const dup = db.types.find((t) => t.name === name);
      if (dup && !dup.archived) { toast('同じ名前の種目があります'); return; }
      let id;
      if (dup) { dup.archived = false; dup.color = state.newColor; id = dup.id; } // 削除済みの同名は復活
      else { id = 't' + uid(); db.types.push({ id, name, color: state.newColor, archived: false }); }
      save();
      state.form.typeId = id; state.addingType = false; state.newName = '';
      renderRecordSheet();
      toast(`「${name}」を追加しました`);
    },
    'delete-type': (b) => {
      const t = db.types.find((x) => x.id === b.dataset.id);
      if (!t) return;
      if (!confirm(`「${t.name}」を種類の一覧から削除しますか？\n過去の記録は残ります。`)) return;
      t.archived = true;
      save();
      if (state.form.typeId === t.id) state.form.typeId = (activeTypes()[0] || {}).id || null;
      renderRecordSheet();
    },
    'save-record': () => {
      const f = state.form;
      f.memo = $('#f-memo').value.trim();
      if (!f.typeId || !db.types.some((t) => t.id === f.typeId)) { toast('運動の種類を選んでください'); return; }
      const durationSec = cleanDuration(f.durationSec);
      const focus = cleanFocus(f.focus) ?? 0;
      if (f.id) {
        const r = db.records.find((x) => x.id === f.id);
        if (r) { r.date = f.date; r.typeId = f.typeId; r.memo = f.memo; r.durationSec = durationSec; r.focus = focus; r.updatedAt = Date.now(); }
      } else {
        db.records.push({ id: 'r' + uid(), date: f.date, typeId: f.typeId, memo: f.memo, durationSec, focus, createdAt: Date.now() });
      }
      if (!save()) return;
      if (!f.id && f.fromStopwatch && durationSec) swReset(); // 記録したらストップウォッチを0に戻す
      state.lastTypeId = f.typeId;
      const d = parseYmd(f.date);
      state.calY = d.getFullYear(); state.calM = d.getMonth(); state.sel = f.date;
      closeSheet();
      render();
      toast(f.id ? '更新しました' : '記録しました');
    },
    'delete-record': () => {
      if (!confirm('この記録を削除しますか？')) return;
      db.records = db.records.filter((r) => r.id !== state.form.id);
      save();
      closeSheet();
      render();
      toast('削除しました');
    },
    'clear-duration': () => { keepTyped(); state.form.durationSec = null; state.form.fromStopwatch = false; renderRecordSheet(); },
    'use-stopwatch': () => {
      keepTyped();
      swPause();
      state.form.durationSec = Math.round(swMs() / 1000);
      state.form.fromStopwatch = true;
      renderRecordSheet();
      syncTicker();
    },
    'sw-toggle': () => { if (sw.running) swPause(); else swStart(); tickStopwatch(); syncTicker(); },
    'sw-reset': () => {
      if (swMs() >= 60000 && !confirm('ストップウォッチを0に戻しますか？')) return;
      swReset(); tickStopwatch(); syncTicker();
    },
    'sw-record': () => {
      swPause(); tickStopwatch(); syncTicker();
      const sec = Math.round(swMs() / 1000);
      if (sec < 1) return;
      openRecordSheet(null, { durationSec: sec, date: todayStr() });
    },
    'ana-view': (b) => { state.anaView = b.dataset.v; renderAnalysis(); },
    'ana-year': (b) => { state.anaYear += Number(b.dataset.k); renderAnalysis(); },
    'open-settings': () => { $('#app-version').textContent = `運動管理アプリ v${APP_VERSION}`; openSheet('settings'); },
    'export': () => exportData()
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const fn = actions[b.dataset.action];
    if (fn) fn(b, e);
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'f-newname') state.newName = e.target.value;
    if (e.target.id === 'f-memo' && state.form) state.form.memo = e.target.value;
    if (e.target.id === 'f-focus' && state.form) {
      // ドラッグ中は描き直さず、数字と色だけ更新する
      const v = Number(e.target.value);
      state.form.focus = v;
      const out = $('#f-focus-val');
      out.textContent = signed(v);
      out.className = `focus-val num ${focusClass(v)}`;
      e.target.className = `focus-range ${focusClass(v)}`;
      e.target.style.setProperty('--p', `${(v + 10) * 5}%`);
      e.target.setAttribute('aria-valuetext', signed(v));
    }
  });
  // 再描画の前に、入力途中のメモを控えておく
  function keepTyped() { const m = $('#f-memo'); if (m && state.form) state.form.memo = m.value; }
  document.addEventListener('change', (e) => {
    if (e.target.id === 'f-date' && state.form) {
      if (e.target.value) state.form.date = e.target.value;
      state.form.memo = $('#f-memo').value;
      renderRecordSheet();
    }
    if (e.target.id === 'import-file') importData(e.target);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.sheet) closeSheet();
    if (e.key === 'Enter' && e.target.id === 'f-newname') { e.preventDefault(); actions['confirm-add-type'](); }
  });

  // カレンダーを左右スワイプで月移動
  let sx = null, sy = null;
  $('#view-calendar').addEventListener('touchstart', (e) => {
    if (!e.target.closest('#cal')) { sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  $('#view-calendar').addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dy) < 40) moveMonth(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------------- バックアップ ---------------- */
  async function exportData() {
    const json = JSON.stringify({ ...db, exportedAt: new Date().toISOString(), app: 'undo-kanri' }, null, 2);
    const name = `undo-kanri-backup-${todayStr()}.json`;
    const file = new File([json], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: '運動管理アプリ バックアップ' }); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function importData(input) {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!isValidDb(d)) throw new Error('invalid');
      if (!confirm(`バックアップの内容（記録 ${d.records.length}件）で、今のデータを置き換えます。よろしいですか？`)) return;
      db = { version: 1, types: d.types.map((t) => ({ id: t.id, name: t.name, color: t.color, archived: !!t.archived })), records: d.records.map((r) => ({ id: r.id, date: r.date, typeId: r.typeId, memo: typeof r.memo === 'string' ? r.memo : '', durationSec: cleanDuration(r.durationSec), focus: cleanFocus(r.focus), createdAt: r.createdAt || 0 })) };
      save();
      closeSheet();
      render();
      toast('読み込みました');
    } catch (err) {
      toast('このファイルは読み込めません');
    }
  }

  // 日付が変わったとき・アプリに戻ったときに描き直す
  let lastDay = todayStr();
  document.addEventListener('visibilitychange', () => {
    syncTicker();
    if (document.visibilityState !== 'visible') return;
    if (sw.running) wakeLock(true); // 画面ロックで外れた分を取り直す
    const t = todayStr();
    if (t !== lastDay) {
      if (state.sel === lastDay) state.sel = t;
      lastDay = t;
      const d = parseYmd(t); state.calY = d.getFullYear(); state.calM = d.getMonth();
    }
    if (!state.sheet) render();
  });

  // 前回計測中のまま閉じていたら、ストップウォッチ画面から始める
  if (sw.running) state.tab = 'stopwatch';
  render();
  if (sw.running) wakeLock(true);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
