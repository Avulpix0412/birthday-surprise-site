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

function drawRainFireworks(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(220, 230, 245, 0.5)";
  ctx.lineWidth = 1.2;
  state.drops.forEach((d) => {
    const y = rainDropY(t, d.phase, d.speed, h);
    ctx.beginPath();
    ctx.moveTo(d.x, y);
    ctx.lineTo(d.x - 6, y + 18);
    ctx.stroke();
  });

  state.bursts = state.bursts.filter((b) => t - b.start < 900);
  if (t - state.lastBurst > 1800 + Math.random() * 1200) {
    state.lastBurst = t;
    state.bursts.push({
      start: t,
      x: w * (0.3 + Math.random() * 0.5),
      y: h * (0.15 + Math.random() * 0.2),
      hue: Math.floor(Math.random() * 360),
    });
  }
  state.bursts.forEach((b) => {
    const age = t - b.start;
    const progress = sparkleProgress(age, 900);
    const radius = progress * 60;
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.strokeStyle = `hsl(${b.hue}, 85%, 70%)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + Math.cos(angle) * radius, b.y + Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

function drawTwinkle(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.stars.forEach((s) => {
    const a = twinkleAlpha(t, s.phase, s.speed);
    ctx.globalAlpha = 0.3 + a * 0.7;
    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawDriftClouds(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.clouds.forEach((c) => {
    const x = cloudOffsetX(t + c.phase, c.speed, w + 200) - 100;
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawSparkleBurst(ctx, w, h, t, state) {
  ctx.clearRect(0, 0, w, h);
  state.sparkles.forEach((s) => {
    const progress = sparkleProgress(t + s.phase, s.duration);
    const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    ctx.globalAlpha = Math.max(0, alpha) * 0.85;
    ctx.fillStyle = "#fff6cc";
    const size = 3 + progress * 5;
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
  ctx.globalAlpha = 1;
}

const EFFECTS = {
  "rain-fireworks": {
    init: (w, h) => ({
      drops: Array.from({ length: 70 }, () => ({
        x: Math.random() * w,
        phase: Math.random() * h,
        speed: 0.5 + Math.random() * 0.3,
      })),
      bursts: [],
      lastBurst: 0,
    }),
    draw: drawRainFireworks,
  },
  twinkle: {
    init: (w, h) => ({
      stars: Array.from({ length: 24 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.65,
        r: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      })),
    }),
    draw: drawTwinkle,
  },
  "drift-clouds": {
    init: (w, h) => ({
      clouds: Array.from({ length: 3 }, (_, i) => ({
        y: h * (0.06 + i * 0.05),
        rx: 50 + Math.random() * 40,
        ry: 14 + Math.random() * 8,
        speed: 0.01 + Math.random() * 0.008,
        phase: Math.random() * 5000,
        alpha: 0.35 + Math.random() * 0.2,
      })),
    }),
    draw: drawDriftClouds,
  },
  "sparkle-burst": {
    init: (w, h) => ({
      sparkles: Array.from({ length: 14 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        duration: 1400 + Math.random() * 1200,
        phase: Math.random() * 3000,
      })),
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
