(() => {
'use strict';
const EMAIL = 'himanshuworkofficial@gmail.com';
const HANDLE = 'himanshu.bais';
const FILTERS = [['all', 'For you'], ['films', 'Films'], ['ads', 'Ads'], ['posters', 'Posters'], ['experiments', 'Experiments']];
const ICONS = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5S3.5 15.4 3.5 9.3A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.5 2.4c0 6.1-8.5 11.2-8.5 11.2Z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M20.5 11.6a8.3 8.3 0 0 1-12.2 7.3L3.5 20.5l1.6-4.6a8.3 8.3 0 1 1 15.4-4.3Z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M21 3.5 10.4 14.1M21 3.5l-6.7 17-3.9-6.4L4 10.2l17-6.7Z"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  soundOn: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5l5 4v-13l-5 4H4ZM16 9a4.2 4.2 0 0 1 0 6M18.5 6.5a7.8 7.8 0 0 1 0 11"/></svg>',
  soundOff: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5l5 4v-13l-5 4H4ZM16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path class="fill" d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path class="fill" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  reels: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M3.5 8.5h17M8 3.5l2.8 5M14 3.5l2.8 5M10.3 11.8v5l4.4-2.5-4.4-2.5Z"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.2" r="4.2"/><path d="M4 20.5a8 8 0 0 1 16 0"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7.5 8 6 8-6"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="m4 16 4.5-4.5 4 4 3-3 4.5 4.5"/><circle cx="15.5" cy="8.5" r="1.4"/></svg>'
};
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const feed = $('feed'), muteBtn = $('mute'), sheet = $('sheet'), backdrop = $('sheet-backdrop'), toast = $('toast');
let videos = [], posters = [], items = [], shown = [];
let filter = 'all', view = 'feed', active = null, muted = true, userPaused = false, observer = null, sheetReturn = null;
let liked = new Set();
try { liked = new Set(JSON.parse(localStorage.getItem('liked') || '[]')); } catch (e) {}
const saveLikes = () => { try { localStorage.setItem('liked', JSON.stringify([...liked])); } catch (e) {} };

document.querySelectorAll('[data-icon]').forEach(n => { n.innerHTML = ICONS[n.dataset.icon]; });

/* ---------- data ---------- */
const getJSON = url => fetch(url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw Error(url); return r.json(); });
Promise.all([getJSON('media.json'), getJSON('posters.json').catch(() => [])]).then(([v, p]) => {
  videos = v.map(w => ({ kind: 'video', id: w.file, title: w.title, type: w.type, category: w.category, thumb: w.poster, src: 'media/' + w.file + '.mp4', caption: w.credit, link: 'https://drive.google.com/file/d/' + w.id + '/view' }));
  posters = p.map(w => ({ kind: 'image', id: w.file, title: w.title, type: w.type || 'Poster', category: 'posters', thumb: w.src, src: w.src, caption: w.caption || '', link: w.src }));
  items = mix();
  $('stat-videos').textContent = videos.length;
  $('stat-posters').textContent = posters.length;
  $('skill-strip').innerHTML = posters.slice(0, 5).map(p => '<img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + ' poster" loading="lazy">').join('');
  renderChips();
  const wanted = decodeURIComponent(location.hash.slice(1));
  renderFeed(wanted);
  renderGrid();
}).catch(() => {
  feed.setAttribute('aria-busy', 'false');
  feed.append(el('p', 'feed-error', 'The work could not load. Please refresh.'));
});

/* For you: two videos, then a poster; the skill card follows the first poster. */
function mix() {
  const out = [], ps = posters.slice();
  videos.forEach((v, i) => {
    out.push(v);
    if (i % 2 === 0 && ps.length) {
      const first = ps.length === posters.length;
      out.push(ps.shift());
      if (first) out.push({ kind: 'card', id: 'skills', category: 'card', title: 'Scalable content creation' });
    }
  });
  out.push(...ps);
  if (!posters.length) out.splice(1, 0, { kind: 'card', id: 'skills', category: 'card', title: 'Scalable content creation' });
  out.push({ kind: 'card', id: 'contact', category: 'card', title: 'Contact' });
  return out;
}
const byFilter = f => f === 'all' ? items : items.filter(i => i.category === f);

/* ---------- chips ---------- */
function renderChips() {
  ['feed-filters', 'grid-filters'].forEach(id => {
    $(id).innerHTML = FILTERS.filter(([k]) => k === 'all' || items.some(i => i.category === k))
      .map(([k, label]) => '<button type="button" data-filter="' + k + '" aria-pressed="' + (k === filter) + '">' + (id === 'grid-filters' && k === 'all' ? 'All' : label) + '</button>').join('');
  });
}
function setFilter(f, jumpTo) {
  filter = f;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
  renderFeed(jumpTo);
  renderGrid();
}
document.addEventListener('click', e => {
  const chip = e.target.closest('.chips [data-filter]');
  if (chip) setFilter(chip.dataset.filter);
  const go = e.target.closest('[data-goto-filter]');
  if (go) { setFilter(go.dataset.gotoFilter); setView('feed'); }
});

/* ---------- feed ---------- */
function renderFeed(jumpTo) {
  if (observer) observer.disconnect();
  active = null; userPaused = false;
  shown = byFilter(filter);
  feed.replaceChildren(...shown.map(buildReel));
  feed.setAttribute('aria-busy', 'false');
  feed.scrollTop = 0;
  observer = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting && en.intersectionRatio >= .6) activate(en.target); });
  }, { root: feed, threshold: [.6] });
  feed.querySelectorAll('.reel').forEach(r => observer.observe(r));
  const target = jumpTo && feed.querySelector('.reel[data-id="' + CSS.escape(jumpTo) + '"]');
  if (target) { feed.scrollTop = target.offsetTop; activate(target); }
  else if (feed.firstElementChild) activate(feed.firstElementChild);
}

function buildReel(item, index) {
  const reel = el('section', 'reel reel-' + item.kind);
  reel.dataset.id = item.id;
  reel.setAttribute('aria-label', item.title);
  if (item.kind === 'card') { reel.innerHTML = item.id === 'skills' ? skillCard() : contactCard(); return reel; }

  const bg = el('div', 'reel-bg');
  bg.style.backgroundImage = 'url("' + item.thumb + '")';
  let media;
  if (item.kind === 'video') {
    media = el('video', 'reel-media');
    media.playsInline = true; media.loop = true; media.muted = true; media.preload = 'none';
    media.poster = item.thumb; media.dataset.src = item.src;
    media.setAttribute('playsinline', '');
  } else {
    media = el('img', 'reel-media');
    media.src = item.src; media.alt = item.title + ' — ' + item.type; media.loading = index < 2 ? 'eager' : 'lazy';
    media.decoding = 'async';
  }
  const tap = el('button', 'reel-tap');
  tap.type = 'button';
  tap.setAttribute('aria-label', item.kind === 'video' ? 'Play or pause ' + item.title : item.title + '. Tap to view without captions, double tap to like');

  const info = el('div', 'reel-info',
    '<div class="who"><span class="avatar" aria-hidden="true">HB</span><strong>' + HANDLE + '</strong><a class="follow" href="mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project enquiry — ' + item.title) + '">Hire me</a></div>' +
    '<h2>' + esc(item.title) + '</h2>' +
    '<p class="cap">' + esc(item.caption) + '</p>' +
    '<span class="tag">' + (item.kind === 'video' ? ICONS.reels : ICONS.image) + esc(item.type) + '</span>');

  const rail = el('div', 'reel-rail',
    '<button type="button" data-act="like" aria-pressed="' + liked.has(item.id) + '">' + ICONS.heart + '<span>' + (liked.has(item.id) ? 'Liked' : 'Like') + '</span></button>' +
    '<button type="button" data-act="info">' + ICONS.info + '<span>Details</span></button>' +
    '<button type="button" data-act="share">' + ICONS.share + '<span>Share</span></button>' +
    '<a href="' + esc(item.link) + '" target="_blank" rel="noopener noreferrer">' + ICONS.open + '<span>' + (item.kind === 'video' ? 'Original' : 'Full size') + '</span></a>');

  reel.append(bg, media, el('div', 'reel-shade'), tap, info, rail,
    el('div', 'burst', ICONS.heart), el('div', 'flash'), el('p', 'reel-msg'));
  if (item.kind === 'video') {
    const bar = el('div', 'reel-progress', '<i></i>');
    reel.append(bar);
    media.addEventListener('timeupdate', () => { if (media.duration) bar.firstChild.style.width = (media.currentTime / media.duration * 100) + '%'; });
    media.addEventListener('loadedmetadata', () => reel.classList.toggle('portrait', media.videoHeight > media.videoWidth));
    media.addEventListener('waiting', () => reel.classList.add('buffering'));
    ['playing', 'pause', 'canplay'].forEach(ev => media.addEventListener(ev, () => reel.classList.remove('buffering')));
    media.addEventListener('error', () => { if (media.getAttribute('src')) { reel.classList.remove('buffering'); reel.querySelector('.reel-msg').textContent = 'This video could not load. Tap Original to watch it in Drive.'; } });
  }
  return reel;
}

function skillCard() {
  const thumbs = posters.slice(0, 3).map(p => '<img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + ' poster" loading="lazy">').join('');
  return '<div class="card-body"><p class="eyebrow">Skill</p><h2>Scalable content creation</h2>' +
    '<p>My poster skill turns a topic into a concept-led poster: a visual metaphor, a headline and a finished layout. Built to repeat, so one brief can become a whole series.</p>' +
    (thumbs ? '<div class="card-fan">' + thumbs + '</div>' : '') +
    '<div class="card-actions"><button class="btn btn-primary" type="button" data-goto-filter="posters">See the posters</button><button class="btn" type="button" data-view="profile">All skills</button></div></div>';
}
function contactCard() {
  return '<div class="card-body"><p class="eyebrow">Let’s make something</p><h2>Have a project in mind?</h2>' +
    '<p>Films, commercials and poster series, from concept to final frame.</p>' +
    '<div class="card-actions card-stack"><a class="btn btn-primary" href="mailto:' + EMAIL + '">' + EMAIL + '</a><a class="btn" href="tel:+916387705476">+91 6387705476</a>' +
    '<a class="btn" href="https://www.linkedin.com/in/himanshu-bais-23218b272" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div>';
}

/* ---------- playback ---------- */
const videoOf = reel => reel && reel.querySelector('video');
function load(reel) { const v = videoOf(reel); if (v && !v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; } }
function activate(reel) {
  if (reel === active) return;
  const prev = videoOf(active);
  if (prev) { prev.pause(); try { prev.currentTime = 0; } catch (e) {} }
  if (active) active.classList.remove('is-active', 'paused');
  active = reel; userPaused = false;
  $('view-feed').classList.remove('clean');
  reel.classList.add('is-active');
  load(reel);
  const nextV = videoOf(reel.nextElementSibling);
  if (nextV && !nextV.getAttribute('src')) { nextV.src = nextV.dataset.src; nextV.preload = 'metadata'; }
  play();
  if (history.replaceState) history.replaceState(null, '', '#' + encodeURIComponent(reel.dataset.id));
}
function play() {
  const v = videoOf(active);
  if (!v || view !== 'feed' || userPaused || document.hidden) return;
  v.muted = muted;
  const p = v.play();
  if (p) p.catch(err => {
    if (err.name !== 'NotAllowedError') return;
    if (!v.muted) { setMuted(true); v.play().catch(() => {}); }
    else { userPaused = true; active.classList.add('paused'); }
  });
}
function togglePause() {
  const v = videoOf(active); if (!v) return;
  userPaused = !v.paused;
  active.classList.toggle('paused', userPaused);
  if (userPaused) v.pause(); else play();
  flash(active, userPaused ? 'pause' : 'play');
}
function setMuted(m) {
  muted = m;
  muteBtn.innerHTML = ICONS[m ? 'soundOff' : 'soundOn'];
  muteBtn.setAttribute('aria-pressed', String(m));
  muteBtn.setAttribute('aria-label', m ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off');
  const v = videoOf(active); if (v) v.muted = m;
}
function flash(reel, icon) {
  const f = reel.querySelector('.flash'); if (!f) return;
  f.innerHTML = ICONS[icon]; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
setMuted(true);
muteBtn.addEventListener('click', () => { setMuted(!muted); if (active) flash(active, muted ? 'soundOff' : 'soundOn'); });
document.addEventListener('visibilitychange', () => { const v = videoOf(active); if (document.hidden) { if (v) v.pause(); } else play(); });

/* ---------- reel actions ---------- */
const itemOf = reel => items.find(i => i.id === reel.dataset.id);
function like(reel, force) {
  const id = reel.dataset.id, on = force || !liked.has(id);
  if (on) liked.add(id); else liked.delete(id);
  saveLikes();
  const b = reel.querySelector('[data-act="like"]');
  if (b) { b.setAttribute('aria-pressed', String(on)); b.lastChild.textContent = on ? 'Liked' : 'Like'; }
}
function burst(reel) { const b = reel.querySelector('.burst'); b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); }
let tapTimer = 0;
feed.addEventListener('click', e => {
  const reel = e.target.closest('.reel'); if (!reel) return;
  const viewBtn = e.target.closest('.reel [data-view]');
  if (viewBtn) return setView(viewBtn.dataset.view);
  if (e.target.closest('.reel-tap')) {
    if (tapTimer) { clearTimeout(tapTimer); tapTimer = 0; like(reel, true); burst(reel); return; }
    tapTimer = setTimeout(() => { tapTimer = 0; if (reel !== active) return; if (videoOf(reel)) togglePause(); else $('view-feed').classList.toggle('clean'); }, 240);
    return;
  }
  const act = e.target.closest('[data-act]'); if (!act) return;
  if (act.dataset.act === 'like') { like(reel); if (liked.has(reel.dataset.id)) burst(reel); }
  if (act.dataset.act === 'info') openSheet(itemOf(reel), act);
  if (act.dataset.act === 'share') share(itemOf(reel));
});
function share(item) {
  const url = location.origin + location.pathname + '#' + encodeURIComponent(item.id);
  const title = item.title + ' — Himanshu Bais';
  if (navigator.share) return navigator.share({ title, url }).catch(() => {});
  const done = () => say('Link copied');
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => say(url)); else say(url);
}
let toastTimer = 0;
function say(text) { toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); }

/* ---------- details sheet ---------- */
function openSheet(item, from) {
  sheetReturn = from;
  $('sheet-title').textContent = item.title;
  $('sheet-type').textContent = item.type + ' · ' + HANDLE;
  $('sheet-text').textContent = item.caption;
  $('sheet-actions').innerHTML =
    '<a class="btn btn-primary" href="mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project enquiry — ' + item.title) + '">Work with me</a>' +
    '<a class="btn" href="' + esc(item.link) + '" target="_blank" rel="noopener noreferrer">' + (item.kind === 'video' ? 'Watch original in Drive' : 'Open full-size image') + ' ↗</a>';
  sheet.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(() => { sheet.classList.add('open'); backdrop.classList.add('open'); });
  $('sheet-close').focus();
}
function closeSheet() {
  if (sheet.hidden) return;
  sheet.classList.remove('open'); backdrop.classList.remove('open');
  setTimeout(() => { sheet.hidden = true; backdrop.hidden = true; }, 220);
  if (sheetReturn) sheetReturn.focus();
}
$('sheet-close').addEventListener('click', closeSheet);
backdrop.addEventListener('click', closeSheet);

/* ---------- grid ---------- */
function renderGrid() {
  const list = byFilter(filter).filter(i => i.kind !== 'card');
  $('grid-count').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
  $('grid').innerHTML = list.map(i =>
    '<button type="button" class="tile" data-open="' + esc(i.id) + '" aria-label="Open ' + esc(i.title) + '">' +
    '<img src="' + esc(i.thumb) + '" alt="" loading="lazy"><i>' + (i.kind === 'video' ? ICONS.reels : ICONS.image) + '</i><span>' + esc(i.title) + '</span></button>').join('');
}
$('grid').addEventListener('click', e => {
  const t = e.target.closest('[data-open]'); if (!t) return;
  setView('feed');
  const target = feed.querySelector('.reel[data-id="' + CSS.escape(t.dataset.open) + '"]');
  if (target) { feed.scrollTop = target.offsetTop; activate(target); }
});

/* ---------- views ---------- */
function setView(name) {
  view = name;
  ['feed', 'grid', 'profile'].forEach(v => { $('view-' + v).hidden = v !== name; });
  document.querySelectorAll('.tabbar [data-view]').forEach(b => { if (b.dataset.view === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  document.body.dataset.view = name;
  closeSheet();
  const v = videoOf(active);
  if (name === 'feed') { if (active) feed.scrollTop = active.offsetTop; play(); }
  else { if (v) v.pause(); $('view-' + name).scrollTop = 0; }
}
document.querySelector('.tabbar').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view); });
document.body.dataset.view = 'feed';

/* ---------- navigation ---------- */
function step(dir) {
  if (view !== 'feed' || !active) return;
  const to = dir > 0 ? active.nextElementSibling : active.previousElementSibling;
  if (to) to.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
$('prev').addEventListener('click', () => step(-1));
$('next').addEventListener('click', () => step(1));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') return closeSheet();
  if (view !== 'feed' || !sheet.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
  const onControl = e.target.closest('a,button') && !e.target.closest('.reel-tap');
  if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'PageDown') { e.preventDefault(); step(1); }
  else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
  else if (e.key === 'm') setMuted(!muted);
  else if (e.key === 'l' && active && active.dataset.id && !active.classList.contains('reel-card')) { like(active); if (liked.has(active.dataset.id)) burst(active); }
  else if (e.key === ' ' && !onControl) { e.preventDefault(); togglePause(); }
});
})();
