/* =====================================================================
   BHARAT'S ORBIT — ISRO Space Day
   All jokes live in JOKES below. Replace freely — everything else reads
   from this object, so this is the only place you need to edit.
   ===================================================================== */

const JOKES = {
  travel: [
    "Why did the rocket break up with the politician? Every time it tried to launch, the politician kept promising a \"final decision next session.\"",
  ],
  blackhole: [
    "A black hole and a politician have the same skill: both can make a huge budget disappear without emitting a single straight answer.",
  ],
  zerog: [
    "Astronauts float in microgravity because nothing is holding them down — which, coincidentally, is also how most politicians describe their campaign promises after election day.",
  ],
  relativity: [
    "Time slows down the faster you go — which is also the only known way to make a politician's speech feel like it's lasting several geological eras.",
  ],
  carousel: [
    "Space has zero air resistance and zero politicians. Coincidence? NASA won't confirm, ISRO won't deny.",
    "A satellite orbits the Earth every 90 minutes. A politician orbits the truth on a much longer, much less predictable schedule.",
    "Escape velocity is the speed needed to break free of a planet's gravity. Political accountability apparently requires a higher velocity than that.",
    "Black holes have an event horizon — the point past which nothing escapes. Election season has one too; it's called 'the day after voting.'",
    "In space, no one can hear you scream. In Parliament, everyone can hear you scream, they just all do it at the same time so nothing is understood.",
  ],
};

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
  const targets = $$('.explainer-card, .mpanel, .joke-break, .dilation-tool, .bh-layout, .zerog-layout');
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

/* --------------------------- Joke carousel --------------------------- */
function initJokeCarousel() {
  const list = JOKES.carousel;
  let idx = 0;
  const textEl = $('#jokeCarouselText');
  const indexEl = $('#jokeCarouselIndex');

  function render() {
    textEl.textContent = list[idx];
    indexEl.textContent = `${idx + 1} / ${list.length}`;
  }
  $('#jokePrev').addEventListener('click', () => { idx = (idx - 1 + list.length) % list.length; render(); });
  $('#jokeNext').addEventListener('click', () => { idx = (idx + 1) % list.length; render(); });
  render();
}

/* --------------------------- Black hole interactive canvas --------------------------- */
function initBlackHoleCanvas() {
  const canvas = $('#blackHoleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let pointer = { x: canvas.width / 2, y: canvas.height / 2, active: false };

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    pointer.x = canvas.width / 2;
    pointer.y = canvas.height / 2;
    const count = PerfGuard.getMode() === 'low' ? 30 : PerfGuard.getMode() === 'medium' ? 70 : 130;
    particles = Array.from({ length: count }, () => spawnParticle());
  }

  function spawnParticle() {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (canvas.width / 2) + 40;
    return {
      angle,
      radius,
      speed: 0.002 + Math.random() * 0.004,
      size: Math.random() * 2 + 0.6,
      hue: Math.random() > 0.5 ? '255,153,51' : '255,209,102',
    };
  }

  function draw() {
    ctx.fillStyle = 'rgba(10,14,26,0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const eventHorizon = Math.min(canvas.width, canvas.height) * 0.09;

    // event horizon glow
    const grad = ctx.createRadialGradient(cx, cy, eventHorizon * 0.2, cx, cy, eventHorizon * 3);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.4, 'rgba(255,153,51,0.25)');
    grad.addColorStop(1, 'rgba(10,14,26,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, eventHorizon * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx, cy, eventHorizon, 0, Math.PI * 2);
    ctx.fill();

    for (const p of particles) {
      p.angle += p.speed * (1 + eventHorizon / p.radius);
      // slowly drift inward, respawn when swallowed
      p.radius -= 0.15;
      if (p.radius < eventHorizon) {
        Object.assign(p, spawnParticle(), { radius: canvas.width / 2 });
      }
      const targetX = pointer.active ? pointer.x : cx;
      const targetY = pointer.active ? pointer.y : cy;
      const x = targetX + Math.cos(p.angle) * p.radius;
      const y = targetY + Math.sin(p.angle) * p.radius * 0.55;
      ctx.fillStyle = `rgba(${p.hue},0.85)`;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
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
    const scoreEl = document.createElement('div');
    scoreEl.className = 'quiz-score';
    scoreEl.innerHTML = `<div class="score-num">${score} / ${QUIZ_DATA.length}</div><p>Space IQ checkpoint complete.</p>`;
    root.appendChild(scoreEl);
    scoreEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
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
  PerfGuard.init();
  initNav();
  initBoardMode();
  initStarfield();
  initOrbitSpine();
  initReveal();
  initCountUp();
  initMissionTabs();
  initJokeSlots();
  initJokeCarousel();
  initBlackHoleCanvas();
  initRelativityTool();
  initQuiz();
  initHeaderShadow();
});