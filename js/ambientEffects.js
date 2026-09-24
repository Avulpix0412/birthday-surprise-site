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

// Soft drifting gold bokeh dust, layered under every effect for a shared
// "dreamy" quality rather than each effect feeling like an isolated
// gimmick. Slow upward drift + gentle side-to-side sway + a glow.
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

function drawTwinkle(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.stars.forEach((s) => {
    const a = twinkleAlpha(t, s.phase, s.speed);
    const wobbleX = s.x + Math.sin(t * 0.0004 + s.phase) * 6;
    const wobbleY = s.y + Math.cos(t * 0.0003 + s.phase) * 4;
    ctx.globalAlpha = 0.35 + a * 0.65;
    ctx.shadowBlur = 14 + a * 10;
    ctx.shadowColor = "rgba(255, 244, 200, 0.95)";
    ctx.fillStyle = "#fffae6";
    ctx.beginPath();
    ctx.arc(wobbleX, wobbleY, s.r + a * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawDriftClouds(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.clouds.forEach((c) => {
    const x = cloudOffsetX(t + c.phase, c.speed, w + 300) - 150;
    ctx.globalAlpha = c.alpha;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  drawDust(ctx, w, h, t, state.dust);
}

function drawSparkleBurst(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
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

  drawDust(ctx, w, h, t, state.dust);
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
  twinkle: {
    init: (w, h) => ({
      stars: Array.from({ length: 38 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.65,
        r: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      })),
    }),
    draw: drawTwinkle,
  },
  "drift-clouds": {
    init: (w, h) => ({
      clouds: Array.from({ length: 4 }, (_, i) => ({
        y: h * (0.05 + i * 0.045),
        rx: 65 + Math.random() * 50,
        ry: 18 + Math.random() * 10,
        speed: 0.028 + Math.random() * 0.02,
        phase: Math.random() * 5000,
        alpha: 0.55 + Math.random() * 0.25,
      })),
      dust: makeDust(w, h, 14),
    }),
    draw: drawDriftClouds,
  },
  "sparkle-burst": {
    init: (w, h) => ({
      sparkles: Array.from({ length: 22 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.65,
        duration: 1200 + Math.random() * 1100,
        phase: Math.random() * 3000,
      })),
      dust: makeDust(w, h, 14),
    }),
    draw: drawSparkleBurst,
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
