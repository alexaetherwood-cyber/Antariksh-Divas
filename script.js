/* =====================================================================
   BHARAT'S ORBIT — ISRO Space Day
   All jokes live in JOKES below. Replace freely — everything else reads
   from this object, so this is the only place you need to edit.
   ===================================================================== */

const JOKES = {
  missions: [
    "Fun fact: building a satellite takes years of precision engineering. Passing a space-funding bill takes only slightly longer.",
  ],
  travel: [
    "Why did the rocket break up with the politician? Every time it tried to launch, the politician kept promising a \"final decision next session.\"",
  ],
  blackhole: [
    "A black hole and a politician have the same skill: both can make a huge budget disappear without emitting a single straight answer.",
  ],
  zerogMid: [
    "Fun fact: unlike astronauts, politicians achieve weightlessness the moment a hard question enters the room.",
  ],
  zerog: [
    "Astronauts float in microgravity because nothing is holding them down — which, coincidentally, is also how most politicians describe their campaign promises after election day.",
  ],
  relativity: [
    "Time slows down the faster you go — which is also the only known way to make a politician's speech feel like it's lasting several geological eras.",
  ],
  quiz: [
    "Unlike a politician's promises, every answer in this quiz is checkable, correctable, and doesn't change after election season.",
  ],
  rocketgame: [
    "Real rockets go through years of stage-testing before launch. Government infrastructure projects go through years of testing before anyone remembers what the project even was.",
  ],
};

/* Edit LAUNCH_TARGET to any future date/time to drive the hero countdown widget. */
const LAUNCH_TARGET = new Date(Date.now() + 1000 * 60 * 60 * 24 * 47); // placeholder: ~47 days out

/* --------------------------- Utility --------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =====================================================================
   ADAPTIVE PERFORMANCE IMPROVER
   Measures real frame timing for ~2s, then continuously monitors.
   Downgrades animations/effects automatically if the device is lagging,
   and can recover back to full quality if things speed back up.
   ===================================================================== */
const PerfGuard = (() => {
  let frames = 0;
  let lastTime = performance.now();
  let samples = [];
  let mode = 'calibrating'; // calibrating | high | medium | low
  const perfStateEl = () => document.getElementById('perfState');

  function applyMode(newMode) {
    if (newMode === mode) return;
    mode = newMode;
    document.body.classList.remove('perf-low', 'perf-medium');
    if (mode === 'low') document.body.classList.add('perf-low');
    if (mode === 'medium') document.body.classList.add('perf-medium');
    const el = perfStateEl();
    if (el) {
      el.textContent = mode === 'high' ? 'FULL (auto)' : mode === 'medium' ? 'BALANCED (auto)' : 'LITE (auto)';
      el.classList.remove('state-low', 'state-medium');
      if (mode === 'low') el.classList.add('state-low');
      if (mode === 'medium') el.classList.add('state-medium');
    }
    window.dispatchEvent(new CustomEvent('perfmodechange', { detail: { mode } }));
  }

  function tick(now) {
    const delta = now - lastTime;
    lastTime = now;
    frames++;
    if (frames > 5) samples.push(delta); // skip first few warm-up frames
    if (samples.length > 90) samples.shift(); // rolling window (~1.5s @60fps)

    if (samples.length >= 40) {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      // avg frame time: ~16.7ms = 60fps (great), ~33ms = 30fps (ok), higher = lag
      if (avg > 34) applyMode('low');
      else if (avg > 22) applyMode('medium');
      else applyMode('high');
    }
    requestAnimationFrame(tick);
  }

  function init() {
    if (prefersReducedMotion) {
      applyMode('low');
      const el = perfStateEl();
      if (el) el.textContent = 'REDUCED MOTION';
      return;
    }
    // Low device memory / hardware concurrency hint -> start conservative
    const lowEndHint = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
                        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    if (lowEndHint) applyMode('medium');
    requestAnimationFrame(tick);
  }

  return { init, getMode: () => mode };
})();

/* --------------------------- Nav --------------------------- */
function initNav() {
  const toggle = $('#navToggle');
  const nav = $('#mainNav');
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

/* --------------------------- Smart-board mode --------------------------- */
function initBoardMode() {
  const btn = $('#smartBoardToggle');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('board-mode');
    const on = document.body.classList.contains('board-mode');
    btn.style.borderColor = on ? 'var(--saffron)' : '';
  });
}

/* --------------------------- Starfield canvas --------------------------- */
function initStarfield() {
  const canvas = $('#starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const density = PerfGuard.getMode() === 'low' ? 0 : PerfGuard.getMode() === 'medium' ? 60 : 140;
    stars = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      s: Math.random() * 0.3 + 0.05,
    }));
  }

  function draw() {
    if (document.body.classList.contains('perf-low')) return; // canvas hidden via CSS anyway
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const s of stars) {
      s.y += s.s;
      if (s.y > h) s.y = 0;
      ctx.globalAlpha = 0.4 + Math.sin(s.y * 0.01) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('perfmodechange', resize);
  resize();
  if (!prefersReducedMotion) requestAnimationFrame(draw);
}

/* --------------------------- Orbit scroll-spine --------------------------- */
function initOrbitSpine() {
  const path = $('#orbitPath');
  const sat = $('#orbitSat');
  if (!path || !sat) return;
  const length = path.getTotalLength();

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    const point = path.getPointAtLength(progress * length);
    sat.style.top = `${(point.y / 1000) * 100}%`;
    path.style.strokeDasharray = `${progress * length} ${length}`;
  }
  path.style.strokeDasharray = `0 ${length}`;
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* --------------------------- Scroll reveal --------------------------- */
function initReveal() {
  const targets = $$('.explainer-card, .mpanel, .joke-break, .dilation-tool, .bh-layout, .zerog-layout, .compare-block, .rocket-game, .iss-layout');
  targets.forEach(t => t.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
  }, { threshold: 0.15 });
  targets.forEach(t => io.observe(t));
}

/* --------------------------- Telemetry count-up --------------------------- */
function initCountUp() {
  const els = $$('.t-value');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(p * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}

/* --------------------------- Mission tabs --------------------------- */
function initMissionTabs() {
  const tabs = $$('.mtab');
  const panels = $$('.mpanel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => { p.classList.remove('is-active'); p.hidden = true; });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(tab.dataset.target);
      target.hidden = false;
      target.classList.add('is-active');
    });
  });
}

/* --------------------------- Joke slots (inline breaks) --------------------------- */
function initJokeSlots() {
  $$('[data-joke-slot]').forEach(el => {
    const key = el.dataset.jokeSlot;
    const list = JOKES[key];
    if (list && list.length) el.textContent = list[0];
  });
}

/* --------------------------- Fake loading screen --------------------------- */
function initLoadingScreen() {
  const screen = $('#loadingScreen');
  const lineEl = $('#loadingLine');
  const barFill = $('#loadingBarFill');
  const countdownEl = $('#loadingCountdown');
  if (!screen) return;

  const lines = [
    'INITIALIZING GROUND STATION…',
    'CALIBRATING TELEMETRY…',
    'LOCKING ORBITAL PATH…',
    'PRESSURIZING FUEL LINES…',
    'ALL SYSTEMS NOMINAL…',
  ];
  let step = 0;
  const totalSteps = 5;
  const stepDuration = 420; // ms per step

  const interval = setInterval(() => {
    step++;
    const pct = Math.min((step / totalSteps) * 100, 100);
    barFill.style.width = pct + '%';
    if (lineEl) lineEl.textContent = lines[Math.min(step, lines.length - 1)];
    const remaining = Math.max(totalSteps - step, 0);
    if (countdownEl) countdownEl.textContent = remaining > 0 ? `T-MINUS 0${remaining}` : 'LIFTOFF 🚀';

    if (step >= totalSteps) {
      clearInterval(interval);
      setTimeout(() => {
        screen.classList.add('is-hidden');
        document.body.classList.remove('is-loading');
        setTimeout(() => screen.remove(), 700);
      }, 350);
    }
  }, stepDuration);

  // Safety net: never trap the user behind the loading screen for more than 4s.
  setTimeout(() => {
    if (!screen.classList.contains('is-hidden')) {
      clearInterval(interval);
      screen.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      setTimeout(() => screen.remove(), 700);
    }
  }, 4000);
}

/* --------------------------- Launch countdown widget --------------------------- */
function initLaunchCountdown() {
  const els = {
    d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMins'), s: $('#cdSecs'),
  };
  if (!els.d) return;
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const diff = Math.max(LAUNCH_TARGET.getTime() - Date.now(), 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    els.d.textContent = pad(days);
    els.h.textContent = pad(hours);
    els.m.textContent = pad(mins);
    els.s.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);
}

/* --------------------------- Mission passport (gamified scroll progress) --------------------------- */
function initPassport() {
  const stamps = $$('.stamp');
  if (!stamps.length) return;
  const map = new Map(stamps.map(s => [s.dataset.stamp, s]));
  const ids = Array.from(map.keys());
  // rootMargin pulls the trigger line up toward the vertical middle of the
  // viewport, so a stamp lights up once a section is meaningfully on screen —
  // regardless of whether the section is shorter or much taller than the viewport.
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stamp = map.get(entry.target.id);
        if (stamp) stamp.classList.add('is-visited');
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -55% 0px' });
  ids.forEach(id => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
}

/* --------------------------- Text-to-speech "Listen" buttons --------------------------- */
function initListenButtons() {
  if (!('speechSynthesis' in window)) {
    $$('.listen-btn').forEach(btn => btn.style.display = 'none');
    return;
  }
  let currentUtterance = null;
  let currentBtn = null;

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    if (currentBtn) currentBtn.classList.remove('is-speaking');
    currentUtterance = null;
    currentBtn = null;
  }

  $$('.listen-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.listen;
      const section = document.getElementById(sectionId);
      if (!section) return;

      if (currentBtn === btn) { stopSpeaking(); return; }
      stopSpeaking();

      const text = Array.from(section.querySelectorAll('h2, h3, p'))
        .map(el => el.textContent.trim())
        .filter(Boolean)
        .join('. ');

      currentUtterance = new SpeechSynthesisUtterance(text);
      currentUtterance.rate = 0.98;
      currentUtterance.onend = stopSpeaking;
      currentUtterance.onerror = stopSpeaking;
      currentBtn = btn;
      btn.classList.add('is-speaking');
      window.speechSynthesis.speak(currentUtterance);
    });
  });
}

/* --------------------------- Keyboard section navigation --------------------------- */
function initKeyboardNav() {
  const ids = ['top', 'missions', 'travel', 'rocketgame', 'blackhole', 'zerog', 'isstracker', 'relativity', 'quiz'];
  window.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'button', 'select'].includes(tag)) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();

    const positions = ids.map(id => {
      const el = document.getElementById(id);
      return el ? Math.abs(el.getBoundingClientRect().top) : Infinity;
    });
    const currentIdx = positions.indexOf(Math.min(...positions));
    let nextIdx = e.key === 'ArrowDown' ? currentIdx + 1 : currentIdx - 1;
    nextIdx = Math.max(0, Math.min(ids.length - 1, nextIdx));
    const target = document.getElementById(ids[nextIdx]);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
}

/* --------------------------- Confetti (quiz celebration) --------------------------- */
function fireConfetti() {
  const canvas = $('#confettiCanvas');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('is-active');

  const colors = ['#ff9933', '#ffd166', '#10b981', '#f5f7fa'];
  const count = PerfGuard.getMode() === 'low' ? 0 : PerfGuard.getMode() === 'medium' ? 60 : 140;
  const pieces = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 200,
    r: Math.random() * 5 + 3,
    vy: Math.random() * 2 + 2,
    vx: (Math.random() - 0.5) * 2,
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  let frame = 0;
  const maxFrames = 260;
  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    if (frame < maxFrames && count > 0) {
      requestAnimationFrame(draw);
    } else {
      canvas.classList.remove('is-active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(draw);
}

/* --------------------------- Before/after compare slider --------------------------- */
function initCompareSlider() {
  const wrap = $('#compareSlider');
  const clip = $('#compareClip');
  const handle = $('#compareHandle');
  if (!wrap || !clip || !handle) return;

  let dragging = false;

  function setPercent(pct) {
    pct = Math.min(100, Math.max(0, pct));
    clip.style.width = pct + '%';
    handle.style.left = pct + '%';
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }

  function updateFromClientX(clientX) {
    const rect = wrap.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPercent(pct);
  }

  handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
  window.addEventListener('pointermove', (e) => { if (dragging) updateFromClientX(e.clientX); });
  window.addEventListener('pointerup', () => { dragging = false; });
  wrap.addEventListener('pointerdown', (e) => { dragging = true; updateFromClientX(e.clientX); });

  handle.addEventListener('keydown', (e) => {
    const current = parseFloat(handle.style.left) || 50;
    if (e.key === 'ArrowLeft') setPercent(current - 5);
    if (e.key === 'ArrowRight') setPercent(current + 5);
  });

  setPercent(50);
}

/* --------------------------- Build-a-rocket mini-game --------------------------- */
function initRocketGame() {
  const bin = $('#partsBin');
  const slots = $$('.rocket-slot');
  const statusEl = $('#rocketStatus');
  const launchBtn = $('#launchBtn');
  const resetBtn = $('#resetRocketBtn');
  if (!bin || !slots.length) return;

  const PARTS = [
    { id: 'booster', label: 'Booster Stage', icon: '🔥' },
    { id: 'stage2', label: 'Second Stage', icon: '⚙️' },
    { id: 'service', label: 'Service Module', icon: '🛠️' },
    { id: 'nosecone', label: 'Nose Cone / Payload', icon: '📡' },
  ];

  let selectedPart = null; // for click-to-place

  function partInfo(id) { return PARTS.find(p => p.id === id); }

  function fillSlot(slot, partId) {
    const info = partInfo(partId);
    if (!info) return;
    slot.classList.add('is-filled');
    slot.classList.remove('is-dragover', 'is-wrong');
    slot.dataset.filled = partId;
    slot.innerHTML = `<div class="rocket-part-chip"><span>${info.icon}</span><span>${info.label}</span></div>`;
  }

  function emptySlot(slot) {
    const idx = parseInt(slot.dataset.slotIndex, 10);
    const labelMap = { 0: 'Slot 1 — Booster Stage', 1: 'Slot 2 — Second Stage', 2: 'Slot 3 — Service Module', 3: 'Slot 4 — Nose Cone / Payload' };
    slot.classList.remove('is-filled', 'is-wrong');
    delete slot.dataset.filled;
    slot.innerHTML = (idx === 3 ? '<span class="slot-hint mono">TOP</span>' : idx === 0 ? '<span class="slot-hint mono">BOTTOM</span>' : '') +
      `<span class="slot-placeholder">${labelMap[idx]}</span>`;
  }

  function renderBinExcluding() {
    const usedIds = slots.map(s => s.dataset.filled).filter(Boolean);
    bin.innerHTML = '';
    PARTS.filter(p => !usedIds.includes(p.id)).forEach(part => {
      const chip = document.createElement('div');
      chip.className = 'rocket-part';
      chip.draggable = true;
      chip.dataset.partId = part.id;
      chip.innerHTML = `<span>${part.icon}</span><span>${part.label}</span>`;
      chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', part.id));
      chip.addEventListener('click', () => {
        $$('.rocket-part', bin).forEach(c => c.classList.remove('is-selected'));
        if (selectedPart === part.id) { selectedPart = null; return; }
        selectedPart = part.id;
        chip.classList.add('is-selected');
        statusEl.textContent = `Selected: ${part.label}. Now tap an empty slot to place it.`;
      });
      bin.appendChild(chip);
    });
  }

  function placePart(slot, partId) {
    if (slot.dataset.filled) emptySlot(slot); // kick any existing part in this slot back to the bin
    fillSlot(slot, partId);
    renderBinExcluding();
    statusEl.textContent = 'Part placed. Keep going!';
    selectedPart = null;
  }

  slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.classList.add('is-dragover'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('is-dragover'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('is-dragover');
      const partId = e.dataTransfer.getData('text/plain');
      if (partId) placePart(slot, partId);
    });
    slot.addEventListener('click', () => {
      if (slot.dataset.filled) {
        emptySlot(slot);
        renderBinExcluding();
        statusEl.textContent = 'Part returned to bin.';
        return;
      }
      if (selectedPart) placePart(slot, selectedPart);
    });
  });

  function reset() {
    slots.forEach(emptySlot);
    selectedPart = null;
    statusEl.textContent = 'Parts bin ready. Assemble the stack.';
    renderBinExcluding();
  }

  launchBtn.addEventListener('click', () => {
    const allFilled = slots.every(s => s.dataset.filled);
    if (!allFilled) {
      statusEl.textContent = '⚠️ Fill every slot before launch.';
      return;
    }
    const wrongSlots = slots.filter(s => s.dataset.filled !== s.dataset.correct);
    if (wrongSlots.length) {
      statusEl.textContent = `❌ Not quite — ${wrongSlots.length} part(s) in the wrong position. Check the order and try again.`;
      wrongSlots.forEach(s => {
        s.classList.add('is-wrong');
        setTimeout(() => s.classList.remove('is-wrong'), 500);
      });
      return;
    }
    statusEl.textContent = '✅ Perfect stack! Ignition sequence start…';
    const silo = $('.rocket-silo');
    if (silo) silo.classList.add('rocket-launch-anim');
    if (!prefersReducedMotion) fireConfetti();
    setTimeout(() => {
      statusEl.textContent = '🚀 Liftoff! Resetting the pad for the next build…';
      if (silo) silo.classList.remove('rocket-launch-anim');
      reset();
    }, 1500);
  });

  resetBtn.addEventListener('click', reset);
  reset();
}

/* --------------------------- ISS live tracker --------------------------- */
function initIssTracker() {
  const dot = $('#issDot');
  const latEl = $('#issLat');
  const lonEl = $('#issLon');
  const altEl = $('#issAlt');
  const velEl = $('#issVel');
  const statusEl = $('#issStatus');
  if (!dot) return;

  function place(lat, lon) {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    dot.style.left = x + '%';
    dot.style.top = y + '%';
  }

  async function fetchPosition() {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      place(data.latitude, data.longitude);
      latEl.textContent = data.latitude.toFixed(2) + '°';
      lonEl.textContent = data.longitude.toFixed(2) + '°';
      altEl.textContent = Math.round(data.altitude) + ' km';
      velEl.textContent = Math.round(data.velocity).toLocaleString() + ' km/h';
      statusEl.textContent = 'LIVE';
      statusEl.style.color = 'var(--green)';
    } catch (err) {
      statusEl.textContent = 'Signal lost — retrying…';
      statusEl.style.color = 'var(--danger)';
    }
  }

  fetchPosition();
  setInterval(fetchPosition, 6000);
}

/* --------------------------- Certificate generator --------------------------- */
let lastQuizScore = { score: 0, total: 0 };

function initCertificate() {
  const genBtn = $('#certGenerateBtn');
  const nameInput = $('#certName');
  const canvas = $('#certCanvas');
  const downloadLink = $('#certDownloadLink');
  if (!genBtn || !canvas) return;

  genBtn.addEventListener('click', () => {
    const name = (nameInput.value || 'Space Cadet').trim();
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a0e1a');
    grad.addColorStop(1, '#121a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // border
    ctx.strokeStyle = '#ff9933';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.strokeRect(38, 38, W - 76, H - 76);

    // stars
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // emblem
    ctx.font = '70px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚀', W / 2, 150);

    ctx.fillStyle = '#8fa0c2';
    ctx.font = '20px monospace';
    ctx.fillText('BHARAT\'S ORBIT · ISRO SPACE DAY', W / 2, 195);

    ctx.fillStyle = '#f5f7fa';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 260);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(name, W / 2, 360);

    ctx.fillStyle = '#8fa0c2';
    ctx.font = '22px sans-serif';
    ctx.fillText('has successfully completed the Space Day mission briefing', W / 2, 410);

    ctx.fillStyle = '#ff9933';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(`SPACE IQ SCORE: ${lastQuizScore.score} / ${lastQuizScore.total || 5}`, W / 2, 480);

    ctx.fillStyle = '#8fa0c2';
    ctx.font = '18px monospace';
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(dateStr, W / 2, 560);

    ctx.font = '16px monospace';
    ctx.fillText('Mission Control — Ground Track Complete', W / 2, 600);

    canvas.hidden = false;
    const dataUrl = canvas.toDataURL('image/png');
    downloadLink.href = dataUrl;
    downloadLink.hidden = false;
    canvas.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
  });
}

/* --------------------------- Black hole interactive canvas --------------------------- */
function initBlackHoleCanvas() {
  const canvas = $('#blackHoleCanvas');
  const modeBtn = $('#bhModeBtn');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let bgStars = [];
  let pointer = { x: canvas.width / 2, y: canvas.height / 2, active: false, vx: 0, vy: 0 };
  let mode = 'particles'; // 'particles' | 'gargantua'
  let lensPhase = 0;
  let hotspotAngle = 0;
  let tiltX = 0, tiltY = 0; // smoothed parallax offset for Gargantua mode

  // Temperature ramp used by both modes: near the horizon things glow
  // white-hot, then cool through gold to deep ember red further out —
  // a simplified version of how a real accretion disk's blackbody
  // temperature actually falls off with distance.
  function tempColor(t) {
    // t: 0 (hottest, closest) -> 1 (coolest, farthest)
    t = Math.max(0, Math.min(1, t));
    if (t < 0.25) return `255,255,255`;
    if (t < 0.5) return `255,225,180`;
    if (t < 0.75) return `255,178,90`;
    return `255,110,60`;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    pointer.x = canvas.width / 2;
    pointer.y = canvas.height / 2;
    const perf = PerfGuard.getMode();
    const count = perf === 'low' ? 35 : perf === 'medium' ? 90 : 170;
    particles = Array.from({ length: count }, () => spawnParticle());

    const starCount = perf === 'low' ? 0 : perf === 'medium' ? 40 : 90;
    bgStars = Array.from({ length: starCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = (canvas.width / 2) * (0.35 + Math.random() * 0.75);
      return {
        angle, radius,
        baseRadius: radius,
        twinkle: Math.random() * Math.PI * 2,
        size: Math.random() * 1.2 + 0.3,
        drift: (Math.random() - 0.5) * 0.0006,
      };
    });
  }

  function spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (canvas.width / 2) + 40;
    return {
      angle,
      radius,
      speed: 0.002 + Math.random() * 0.004,
      size: Math.random() * 2 + 0.6,
      trail: [],
      justRespawned: true,
    };
  }

  // Faint warped starfield behind the hole: stars near the shadow get
  // pushed outward along their radial line, a cheap stand-in for real
  // gravitational lensing (light from behind the hole bends around it).
  function drawLensedBackground(cx, cy, eventHorizon) {
    const lensStrength = eventHorizon * eventHorizon * 2.4;
    for (const s of bgStars) {
      s.angle += s.drift;
      s.twinkle += 0.03;
      const bend = lensStrength / Math.max(s.radius, eventHorizon * 1.05);
      const r = s.radius + bend;
      const x = cx + Math.cos(s.angle) * r;
      const y = cy + Math.sin(s.angle) * r * 0.9;
      const alpha = 0.25 + Math.sin(s.twinkle) * 0.2 + Math.min(bend / (eventHorizon * 3), 0.35);
      ctx.fillStyle = `rgba(220,230,255,${Math.max(0.08, alpha)})`;
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParticleMode(cx, cy, eventHorizon) {
    const perf = PerfGuard.getMode();
    const trailLen = perf === 'low' ? 0 : perf === 'medium' ? 3 : 6;

    drawLensedBackground(cx, cy, eventHorizon);

    for (const p of particles) {
      // Frame-dragging: things whip around faster the closer they get.
      p.angle += p.speed * (1 + (eventHorizon * eventHorizon) / (p.radius * p.radius) * 6);
      p.radius -= 0.15 + (eventHorizon / p.radius) * 0.25;

      const targetX = pointer.active ? pointer.x : cx;
      const targetY = pointer.active ? pointer.y : cy;
      const x = targetX + Math.cos(p.angle) * p.radius;
      const y = targetY + Math.sin(p.angle) * p.radius * 0.55;

      // Spaghettification: right before infall, stretch the particle into
      // a thin radial streak instead of drawing it as a simple dot.
      const infalling = p.radius < eventHorizon * 1.6;
      const tempT = 1 - Math.min(1, (canvas.width / 2 - p.radius) / (canvas.width / 2));
      const color = tempColor(tempT);

      if (trailLen > 0) {
        p.trail.push({ x, y });
        if (p.trail.length > trailLen) p.trail.shift();
        for (let i = 0; i < p.trail.length - 1; i++) {
          const a = p.trail[i], b = p.trail[i + 1];
          const alpha = (i / p.trail.length) * 0.5;
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = p.size * (i / p.trail.length);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (infalling) {
        const stretch = 1 + (eventHorizon * 1.6 - p.radius) / (eventHorizon * 0.5) * 4;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.angle + Math.PI / 2);
        const streakGrad = ctx.createLinearGradient(0, -stretch, 0, stretch);
        streakGrad.addColorStop(0, `rgba(${color},0)`);
        streakGrad.addColorStop(0.5, `rgba(${color},0.95)`);
        streakGrad.addColorStop(1, `rgba(${color},0)`);
        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = Math.max(0.6, p.size * 0.7);
        ctx.beginPath();
        ctx.moveTo(0, -stretch);
        ctx.lineTo(0, stretch);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = `rgba(${color},0.9)`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.radius < eventHorizon * 0.55) {
        Object.assign(p, spawnParticle(), { radius: canvas.width / 2 });
      }
    }

    // Subtle pulsing photon-sphere shimmer right at the shadow's edge.
    const pulse = 1 + Math.sin(lensPhase) * 0.04;
    lensPhase += 0.04;
    ctx.strokeStyle = 'rgba(255,225,180,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(pointer.active ? pointer.x : cx, pointer.active ? pointer.y : cy, eventHorizon * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  // A stylised, physically-motivated render of gravitational lensing around a
  // black hole's accretion disk — the same real effect (light from the far
  // side of the disk bending over the poles) that Kip Thorne's equations
  // produced for "Gargantua" in Interstellar, and that real telescopes have
  // since photographed around actual black holes (M87*, Sagittarius A*).
  function drawGargantuaMode(cx, cy, eventHorizon) {
    const perf = PerfGuard.getMode();
    lensPhase += 0.01;
    hotspotAngle += 0.012;

    // Smoothly ease the disk tilt toward wherever the pointer is, like a
    // camera drifting around the black hole — a nod to the way the
    // Interstellar shots let the parallax reveal the 3D shape of the disk.
    const targetTiltX = pointer.active ? (pointer.x - cx) / cx : 0;
    const targetTiltY = pointer.active ? (pointer.y - cy) / cy : 0;
    tiltX += (targetTiltX - tiltX) * 0.04;
    tiltY += (targetTiltY - tiltY) * 0.04;

    const diskOuter = eventHorizon * 5.4;
    const squash = 0.3 + tiltY * 0.12; // pointer tilt subtly opens/closes the ellipse
    const rotSkew = tiltX * 0.25;

    drawLensedBackground(cx, cy, eventHorizon * 0.9);

    // faint outer glow
    const glow = ctx.createRadialGradient(cx, cy, eventHorizon, cx, cy, diskOuter * 1.2);
    glow.addColorStop(0, 'rgba(255,209,102,0.2)');
    glow.addColorStop(1, 'rgba(10,14,26,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, diskOuter * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Faint polar jets — thin, flickering beams of superheated particles
    // funnelled out along the black hole's spin axis.
    if (perf !== 'low') {
      [-1, 1].forEach(dir => {
        const jetLen = eventHorizon * (3.4 + Math.sin(lensPhase * 2 + dir) * 0.3);
        const jetGrad = ctx.createLinearGradient(cx, cy, cx + rotSkew * jetLen * 0.4, cy + dir * jetLen);
        jetGrad.addColorStop(0, 'rgba(190,225,255,0.55)');
        jetGrad.addColorStop(1, 'rgba(190,225,255,0)');
        ctx.strokeStyle = jetGrad;
        ctx.lineWidth = eventHorizon * 0.16;
        ctx.beginPath();
        ctx.moveTo(cx, cy + dir * eventHorizon * 0.9);
        ctx.lineTo(cx + rotSkew * jetLen * 0.4, cy + dir * jetLen);
        ctx.stroke();
      });
    }

    // Main flat accretion disk, seen nearly edge-on. Doppler beaming makes
    // matter spinning toward us (left side) glare brighter than matter
    // spinning away (right side) — exactly the asymmetry real simulations
    // and the EHT images of M87*/Sgr A* show.
    const steps = perf === 'low' ? 26 : perf === 'medium' ? 42 : 60;
    for (let i = steps; i > 0; i--) {
      const t = i / steps;
      const r = eventHorizon * 1.15 + t * (diskOuter - eventHorizon * 1.15);
      const baseBrightness = 1 - t * 0.85;
      const hue = tempColor(t);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotSkew * 0.15);
      const beamGrad = ctx.createLinearGradient(-r, 0, r, 0);
      beamGrad.addColorStop(0, `rgba(${hue},${Math.min(1, baseBrightness * 1.6)})`); // approaching side: brighter
      beamGrad.addColorStop(0.5, `rgba(${hue},${baseBrightness})`);
      beamGrad.addColorStop(1, `rgba(${hue},${baseBrightness * 0.4})`); // receding side: dimmer
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = (diskOuter - eventHorizon) / steps + 0.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Orbiting hot-spot: a bright clump of matter circling near the inner
    // edge of the disk — the same kind of feature that produces the
    // "flares" astronomers track around Sagittarius A*.
    const hsR = eventHorizon * 1.35;
    const hsX = cx + Math.cos(hotspotAngle) * hsR;
    const hsY = cy + Math.sin(hotspotAngle) * hsR * squash;
    const hsFront = Math.sin(hotspotAngle) > -0.15; // only draw when not fully hidden behind the shadow
    if (hsFront) {
      const hsGlow = ctx.createRadialGradient(hsX, hsY, 0, hsX, hsY, eventHorizon * 0.5);
      hsGlow.addColorStop(0, 'rgba(255,255,255,0.95)');
      hsGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hsGlow;
      ctx.beginPath();
      ctx.arc(hsX, hsY, eventHorizon * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // event horizon (the black sphere occludes the middle of the disk)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx, cy, eventHorizon, 0, Math.PI * 2);
    ctx.fill();

    // photon ring — a thin, very bright double rim right at the edge of the shadow
    ctx.strokeStyle = 'rgba(255,247,220,0.92)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, eventHorizon * 1.03, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,200,150,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, eventHorizon * 1.1, 0, Math.PI * 2);
    ctx.stroke();

    // Lensed arcs: light from the far side of the disk (and the hot-spot
    // riding on it) gets bent up and over the poles by gravity, forming a
    // secondary warped image above and below the shadow.
    const arcWobble = Math.sin(lensPhase) * 2;
    [-1, 1].forEach(dir => {
      const arcRy = eventHorizon * (1.55 + arcWobble * 0.01 + tiltY * 0.3 * dir);
      const arcRx = eventHorizon * 1.9;
      ctx.save();
      ctx.translate(cx + rotSkew * eventHorizon * 0.6, cy + dir * eventHorizon * 0.05);
      ctx.beginPath();
      ctx.ellipse(0, 0, arcRx, arcRy, 0, dir > 0 ? 0.08 : Math.PI + 0.08, dir > 0 ? Math.PI - 0.08 : 2 * Math.PI - 0.08);
      const arcGrad = ctx.createLinearGradient(-arcRx, 0, arcRx, 0);
      arcGrad.addColorStop(0, 'rgba(255,225,180,0)');
      arcGrad.addColorStop(0.5, 'rgba(255,241,214,0.9)');
      arcGrad.addColorStop(1, 'rgba(255,180,110,0)');
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = eventHorizon * 0.22;
      ctx.stroke();
      ctx.restore();

      // the hot-spot's lensed echo, sliding along the arc as it orbits
      const echoT = (Math.sin(hotspotAngle * -1) + 1) / 2;
      const echoAngle = (dir > 0 ? 0.15 : Math.PI + 0.15) + echoT * (Math.PI - 0.3);
      const ex = cx + rotSkew * eventHorizon * 0.6 + Math.cos(echoAngle) * arcRx;
      const ey = cy + dir * eventHorizon * 0.05 + Math.sin(echoAngle) * arcRy;
      const echoGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eventHorizon * 0.32);
      echoGlow.addColorStop(0, 'rgba(255,255,255,0.85)');
      echoGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = echoGlow;
      ctx.beginPath();
      ctx.arc(ex, ey, eventHorizon * 0.32, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function draw() {
    ctx.fillStyle = mode === 'gargantua' ? 'rgba(10,14,26,0.35)' : 'rgba(10,14,26,0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const eventHorizon = Math.min(canvas.width, canvas.height) * 0.09;

    if (mode === 'gargantua') {
      drawGargantuaMode(cx, cy, eventHorizon);
    } else {
      // event horizon glow (simple mode)
      const originX = pointer.active ? pointer.x : cx;
      const originY = pointer.active ? pointer.y : cy;
      const grad = ctx.createRadialGradient(originX, originY, eventHorizon * 0.2, originX, originY, eventHorizon * 3.2);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.35, 'rgba(255,153,51,0.28)');
      grad.addColorStop(1, 'rgba(10,14,26,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(originX, originY, eventHorizon * 3.2, 0, Math.PI * 2);
      ctx.fill();

      drawParticleMode(cx, cy, eventHorizon);

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(originX, originY, eventHorizon, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; });

  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      mode = mode === 'particles' ? 'gargantua' : 'particles';
      modeBtn.textContent = mode === 'gargantua' ? '🔬 Switch to Simple Mode' : '🎬 Switch to Gargantua Mode';
      modeBtn.classList.toggle('is-active', mode === 'gargantua');
    });
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(draw);
}

/* --------------------------- Relativity: time dilation calculator --------------------------- */
function initRelativityTool() {
  const slider = $('#speedSlider');
  const readout = $('#speedReadout');
  const shipTime = $('#shipTime');
  const gammaVal = $('#gammaVal');

  function update() {
    const percent = parseInt(slider.value, 10);
    const v = percent / 100; // fraction of c
    const gamma = 1 / Math.sqrt(1 - v * v);
    readout.textContent = `${percent}%`;
    shipTime.textContent = `= ${gamma.toFixed(4)} years on Earth`;
    gammaVal.textContent = gamma.toFixed(4);
  }
  slider.addEventListener('input', update);
  update();
}

/* --------------------------- Quiz --------------------------- */
const QUIZ_DATA = [
  {
    q: "Which ISRO mission made India the first country to land near the Moon's south pole?",
    options: ["Mangalyaan", "Chandrayaan-2", "Chandrayaan-3", "Aditya-L1"],
    correct: 2,
  },
  {
    q: "What does 'microgravity' mean for astronauts on the ISS?",
    options: [
      "Gravity is completely switched off",
      "They are in continuous free fall, so gravity feels absent relative to their surroundings",
      "They are too far from Earth for gravity to reach them",
      "Their spacecraft generates anti-gravity fields",
    ],
    correct: 1,
  },
  {
    q: "Why can't light escape a black hole?",
    options: [
      "Light is absorbed by dark matter first",
      "The gravity beyond the event horizon is strong enough that nothing, including light, reaches escape velocity",
      "Black holes are actually made of light-absorbing material",
      "Light slows down and stops near black holes",
    ],
    correct: 1,
  },
  {
    q: "Why do GPS satellites need relativity corrections?",
    options: [
      "Their onboard clocks run slightly differently than clocks on Earth due to speed and weaker gravity",
      "Satellites need extra fuel to fight gravity",
      "GPS uses relativity only for entertainment features",
      "It has nothing to do with time, only with signal strength",
    ],
    correct: 0,
  },
  {
    q: "What was special about India's Mangalyaan mission?",
    options: [
      "It was the first mission to land humans on Mars",
      "It reached Mars orbit successfully on its very first attempt",
      "It was launched from the Moon",
      "It only studied Earth's own atmosphere",
    ],
    correct: 1,
  },
];

function initQuiz() {
  const root = $('#quizRoot');
  let score = 0;
  let answered = 0;

  QUIZ_DATA.forEach((item, qi) => {
    const wrap = document.createElement('div');
    wrap.className = 'quiz-q';
    const p = document.createElement('p');
    p.className = 'qtext';
    p.textContent = `${qi + 1}. ${item.q}`;
    wrap.appendChild(p);

    const optsWrap = document.createElement('div');
    optsWrap.className = 'quiz-options';

    item.options.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.type = 'button';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const buttons = optsWrap.querySelectorAll('.quiz-opt');
        buttons.forEach(b => b.disabled = true);
        if (oi === item.correct) {
          btn.classList.add('correct');
          score++;
        } else {
          btn.classList.add('wrong');
          buttons[item.correct].classList.add('correct');
        }
        answered++;
        if (answered === QUIZ_DATA.length) showScore();
      });
      optsWrap.appendChild(btn);
    });

    wrap.appendChild(optsWrap);
    root.appendChild(wrap);
  });

  function showScore() {
    lastQuizScore = { score, total: QUIZ_DATA.length };

    const scoreEl = document.createElement('div');
    scoreEl.className = 'quiz-score';
    scoreEl.innerHTML = `<div class="score-num">${score} / ${QUIZ_DATA.length}</div><p>Space IQ checkpoint complete.</p>`;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'ctrl-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = '📋 Copy my score';
    copyBtn.addEventListener('click', () => {
      const msg = `I scored ${score}/${QUIZ_DATA.length} on the Bharat's Orbit Space Day quiz! 🚀`;
      navigator.clipboard?.writeText(msg).then(() => {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy my score', 1800);
      }).catch(() => {});
    });
    scoreEl.appendChild(copyBtn);

    root.appendChild(scoreEl);
    scoreEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });

    const certArea = $('#certificateArea');
    if (certArea) certArea.hidden = false;

    if (score === QUIZ_DATA.length) fireConfetti();
  }
}

/* --------------------------- Header shadow on scroll --------------------------- */
function initHeaderShadow() {
  const header = $('#siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 8px 24px -12px rgba(0,0,0,0.6)' : 'none';
  }, { passive: true });
}

/* --------------------------- Init all --------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  PerfGuard.init();
  initNav();
  initBoardMode();
  initStarfield();
  initOrbitSpine();
  initReveal();
  initCountUp();
  initLaunchCountdown();
  initMissionTabs();
  initJokeSlots();
  initPassport();
  initListenButtons();
  initKeyboardNav();
  initCompareSlider();
  initRocketGame();
  initIssTracker();
  initCertificate();
  initBlackHoleCanvas();
  initRelativityTool();
  initQuiz();
  initHeaderShadow();
});