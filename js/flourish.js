export function paletteColor(palette, p) {
  const n = palette.length;
  const i0 = ((Math.floor(p) % n) + n) % n;
  const i1 = (i0 + 1) % n;
  const t = p - Math.floor(p);
  const c0 = palette[i0];
  const c1 = palette[i1];
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
  return `rgb(${r},${g},${b})`;
}

const PALETTE = [
  [201, 141, 143], // rose
  [138, 159, 118], // moss
  [198, 160, 94],  // mustard
  [151, 136, 171], // violet
  [110, 163, 154], // teal
];

const LINE_COUNT = 14;

export function initFlourish(canvas) {
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W, H, DPR;
  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const lines = Array.from({ length: LINE_COUNT }, (_, i) => ({
    yBase: (i + 0.5) / LINE_COUNT,
    amp: 20 + Math.random() * 40,
    speed: 0.08 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    colorPhase: Math.random() * PALETTE.length,
  }));

  function drawFrame(t) {
    ctx.clearRect(0, 0, W, H);
    lines.forEach((line) => {
      const y0 = line.yBase * H;
      ctx.beginPath();
      ctx.strokeStyle = paletteColor(PALETTE, line.colorPhase + t * 0.00003);
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2.4;
      for (let x = 0; x <= W; x += 8) {
        const y = y0 + Math.sin(x * 0.01 + line.phase + t * line.speed * 0.001) * line.amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }

  if (reduceMotion) {
    drawFrame(0);
    return;
  }

  function loop(t) {
    drawFrame(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
