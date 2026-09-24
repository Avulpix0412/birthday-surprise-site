// Pure timing/motion helpers — deterministic functions of elapsed time,
// unit-tested. The canvas rendering that uses them (initAmbientEffect) is
// browser-only and verified visually via /browse, same split as
// js/flourish.js used before it (paletteColor tested, the draw loop not).

export function rainDropY(t, phase, speedPxPerMs, height) {
  return ((t * speedPxPerMs + phase) % height + height) % height;
}

export function twinkleAlpha(t, phase, speed) {
  return (Math.sin(t * speed * 0.001 + phase) + 1) / 2;
}

export function cloudOffsetX(t, speedPxPerMs, wrapWidth) {
  return ((t * speedPxPerMs) % wrapWidth + wrapWidth) % wrapWidth;
}

export function sparkleProgress(elapsedInCycle, durationMs) {
  return (elapsedInCycle % durationMs) / durationMs;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

// Soft drifting gold bokeh dust, layered under several effects for a
// shared "dreamy" quality.
function drawDust(ctx, w, h, t, dust) {
  dust.forEach((p) => {
    const y = h - rainDropY(t, p.phase, p.speed, h + 40);
    const x = p.x + Math.sin(t * 0.0006 + p.sway) * 14;
    const a = 0.35 + twinkleAlpha(t, p.sway, 0.6) * 0.45;
    ctx.globalAlpha = a;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(255, 236, 190, 0.9)";
    ctx.fillStyle = "#fff2cf";
    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function makeDust(w, h, count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    r: 1.5 + Math.random() * 2.5,
    phase: Math.random() * 1000,
    sway: Math.random() * Math.PI * 2,
    speed: 0.012 + Math.random() * 0.018,
  }));
}

function drawRainFireworks(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(225, 238, 255, 0.85)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 4;
  ctx.shadowColor = "rgba(200, 225, 255, 0.6)";
  state.drops.forEach((d) => {
    const y = rainDropY(t, d.phase, d.speed, h);
    ctx.beginPath();
    ctx.moveTo(d.x, y);
    ctx.lineTo(d.x - 10, y + 32);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  drawDust(ctx, w, h, t, state.dust);

  state.bursts = state.bursts.filter((b) => t - b.start < 1100);
  if (t - state.lastBurst > 1000 + Math.random() * 900) {
    state.lastBurst = t;
    state.bursts.push({
      start: t,
      x: w * (0.2 + Math.random() * 0.6),
      y: h * (0.1 + Math.random() * 0.25),
      hue: Math.floor(Math.random() * 360),
    });
  }
  state.bursts.forEach((b) => {
    const age = t - b.start;
    const progress = sparkleProgress(age, 1100);
    const radius = progress * 95;
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.strokeStyle = `hsl(${b.hue}, 90%, 78%)`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 18;
    ctx.shadowColor = `hsl(${b.hue}, 90%, 70%)`;
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + Math.cos(angle) * radius, b.y + Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
}

// Lights placed along the two tree-canopy arcs actually painted in the
// McDonald's-bench scene (converging from the bottom corners toward the
// top center), with a traveling-wave twinkle instead of independent
// random flicker — reads as "these specific string lights are chasing",
// not "random new dots appeared over the picture".
function drawTwinkleChase(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.lights.forEach((l) => {
    const a = twinkleAlpha(t, l.posRatio * 9, 1.4);
    ctx.globalAlpha = 0.35 + a * 0.65;
    ctx.shadowBlur = 16 + a * 8;
    ctx.shadowColor = "rgba(255, 244, 200, 0.95)";
    ctx.fillStyle = "#fff7dc";
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r + a * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  drawDust(ctx, w, h, t, state.dust);
}

// Petals/leaves drifting straight down across the whole frame — much
// higher contrast against a photo than another translucent cloud/star,
// and plausible as atmosphere in any outdoor scene rather than a
// disconnected overlay.
function drawFalling(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.petals.forEach((p) => {
    const y = rainDropY(t, p.phase, p.speed, h + 60) - 40;
    const x = p.x + Math.sin(t * 0.0009 + p.sway) * 26;
    const rot = t * p.rotSpeed + p.rot0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = 0.75;
    ctx.shadowBlur = 6;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawGlowPulse(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  const a = twinkleAlpha(t, 0, 0.7);
  const r = state.baseR * (0.8 + a * 0.4);
  const grad = ctx.createRadialGradient(state.cx, state.cy, 0, state.cx, state.cy, r);
  grad.addColorStop(0, `rgba(196, 150, 255, ${0.32 + a * 0.28})`);
  grad.addColorStop(1, "rgba(196, 150, 255, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(state.cx, state.cy, r, 0, Math.PI * 2);
  ctx.fill();

  state.sparkles.forEach((s) => {
    const progress = sparkleProgress(t + s.phase, s.duration);
    const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 246, 204, 0.95)";
    ctx.fillStyle = "#fffaea";
    const size = 5 + progress * 10;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - size);
    ctx.lineTo(s.x + size * 0.3, s.y - size * 0.3);
    ctx.lineTo(s.x + size, s.y);
    ctx.lineTo(s.x + size * 0.3, s.y + size * 0.3);
    ctx.lineTo(s.x, s.y + size);
    ctx.lineTo(s.x - size * 0.3, s.y + size * 0.3);
    ctx.lineTo(s.x - size, s.y);
    ctx.lineTo(s.x - size * 0.3, s.y - size * 0.3);
    ctx.closePath();
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

const PETAL_COLORS_PINK = ["#f6a8c4", "#f6c3d6", "#f291b0"];
const PETAL_COLORS_GOLD = ["#d9c15a", "#a9c47a", "#e0b45a"];

function makeArcLights(w, h) {
  const count = 16;
  const leftArc = Array.from({ length: count }, (_, i) => {
    const p = i / (count - 1);
    return { x: lerp(0, w * 0.42, p), y: lerp(h * 0.5, h * 0.04, p), posRatio: p, r: 2.5 + Math.random() * 2 };
  });
  const rightArc = Array.from({ length: count }, (_, i) => {
    const p = i / (count - 1);
    return { x: lerp(w, w * 0.58, p), y: lerp(h * 0.5, h * 0.04, p), posRatio: 1 - p, r: 2.5 + Math.random() * 2 };
  });
  return leftArc.concat(rightArc);
}

function makePetals(w, h, colors) {
  return Array.from({ length: 24 }, () => ({
    x: Math.random() * w,
    phase: Math.random() * h,
    speed: 0.05 + Math.random() * 0.05,
    sway: Math.random() * Math.PI * 2,
    r: 6 + Math.random() * 6,
    rot0: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.0015,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

const EFFECTS = {
  "rain-fireworks": {
    init: (w, h) => ({
      drops: Array.from({ length: 110 }, () => ({
        x: Math.random() * w,
        phase: Math.random() * h,
        speed: 0.6 + Math.random() * 0.35,
      })),
      dust: makeDust(w, h, 16),
      bursts: [],
      lastBurst: 0,
    }),
    draw: drawRainFireworks,
  },
  "twinkle-chase": {
    init: (w, h) => ({
      lights: makeArcLights(w, h),
      dust: makeDust(w, h, 10),
    }),
    draw: drawTwinkleChase,
  },
  "petals-pink": {
    init: (w, h) => ({ petals: makePetals(w, h, PETAL_COLORS_PINK) }),
    draw: drawFalling,
  },
  "petals-gold": {
    init: (w, h) => ({ petals: makePetals(w, h, PETAL_COLORS_GOLD) }),
    draw: drawFalling,
  },
  "glow-pulse": {
    init: (w, h) => ({
      cx: w * 0.58,
      cy: h * 0.33,
      baseR: Math.min(w, h) * 0.26,
      sparkles: Array.from({ length: 16 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.65,
        duration: 1200 + Math.random() * 1100,
        phase: Math.random() * 3000,
      })),
    }),
    draw: drawGlowPulse,
  },
};

export function initAmbientEffect(canvas, type) {
  const effect = EFFECTS[type];
  if (!effect) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let { ctx, w, h } = resizeCanvas(canvas);
  let state = effect.init(w, h);

  function onResize() {
    ({ ctx, w, h } = resizeCanvas(canvas));
    state = effect.init(w, h);
  }
  window.addEventListener("resize", onResize);

  if (reduceMotion) {
    effect.draw(ctx, w, h, 0, state);
    return;
  }

  function loop(t) {
    effect.draw(ctx, w, h, t, state);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
