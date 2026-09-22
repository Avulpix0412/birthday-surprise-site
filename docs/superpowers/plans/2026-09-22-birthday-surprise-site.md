# Birthday Surprise Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, mobile-first, animated birthday surprise website (memory timeline + 3 mini-interactions + reveal page with letter/gift/confetti), deployable to GitHub Pages and openable inside WeChat's in-app browser on iPhone.

**Architecture:** Static HTML/CSS/vanilla JS single page. Content (photos, story text, easter-egg text, letter text, gift text, song file) lives in one data file (`js/content.js`) so it can be swapped without touching structure/animation code. Scroll-triggered animations use IntersectionObserver. Mini-games are pure-logic modules (unit-testable with plain Node `assert`) wired to small DOM-rendering functions.

**Tech Stack:** HTML5, CSS3 (animations/transitions), vanilla JavaScript (ES modules), canvas-confetti (CDN, only external dependency), GitHub Pages for hosting. No build step, no framework.

**Spec:** `docs/superpowers/specs/2026-09-22-birthday-surprise-site-design.md`

## Global Constraints

- No backend, no login, no password/quiz-style unlock (spec: "非密码式简单互动")
- No frontend framework, no build tooling — plain HTML/CSS/JS only (spec: 技术方案)
- Only external dependency: canvas-confetti via CDN (spec: 技术方案)
- Must render correctly in WeChat's in-app browser and iOS Safari on an iPhone screen width (spec: 目标环境)
- Audio must not attempt to autoplay on page load — only after a user gesture (spec: 音频)
- Content (photos/text/song) must be swappable via a single data file without editing structure/animation code (spec: 内容与素材)
- Total experience target: 5-10 minutes, 6-8 memory nodes, 3 distinct interaction types (spec: 整体结构)

## Review Focus

- WeChat/iOS autoplay restrictions: audio element must stay silent until the first user tap/click fires `play()` inside that same gesture's event handler — a `<script>`-triggered `play()` on load will be silently blocked. Test: verify audio never starts before the first interaction.
- iOS momentum scrolling can fire IntersectionObserver callbacks in bursts or skip entries at high scroll speed — animations must trigger via the observer's `isIntersecting` flag, not by assuming node order, and repeated triggers must be idempotent (no duplicate class stacking / restart glitches). Test: scroll fast past a node twice, confirm it doesn't visually break.
- Touch target size for puzzle pieces and the click-to-find icons must be at least ~44x44px hit area even if the visual asset is smaller, per iOS tap-target guidance. Test: assert hit areas in the puzzle/easter-egg modules meet a minimum size constant.
- Missing/placeholder image handling: if a photo fails to load (broken path during content swap), the layout must not collapse or leave a broken-image icon breaking the aesthetic — an `onerror` fallback must apply a placeholder style. Test: point a node at a nonexistent image path and confirm fallback class is applied.
- Confetti/animation performance: multiple simultaneous CSS animations plus canvas-confetti must not be triggered redundantly on repeated scroll-into-view of the reveal section — confetti must fire once per session, not every time the section re-enters the viewport. Test: assert the confetti trigger function only fires on first call.

---

## File Structure

```
birthday-surprise-site/
  index.html
  css/
    style.css          # all styles: layout, fonts, animations, clay/scrapbook decoration
  js/
    content.js          # ALL swappable content: memory nodes, easter-egg text, letter text, gift text, song path
    scrollAnimate.js     # IntersectionObserver wiring for scroll-triggered reveal animations
    puzzle.js            # pure logic: shuffle/check functions + DOM rendering for puzzle mini-game
    wheel.js             # pure logic: pick/sequence functions + DOM rendering for wheel/flip-card mini-game
    easterEggs.js        # click-to-find hidden icon logic + DOM rendering
    reveal.js            # letter text animation, gift reveal, confetti trigger (fire-once)
    audio.js             # audio element control, gesture-gated play()
    main.js              # entry point: renders timeline from content.js, wires up all modules in order
  assets/
    images/              # placeholder images (swapped later with real photos)
    audio/                # placeholder mp3 (swapped later with real song)
  tests/
    puzzle.test.mjs       # node --test for puzzle.js pure functions
    wheel.test.mjs        # node --test for wheel.js pure functions
    easterEggs.test.mjs   # node --test for hit-area/size constants
    reveal.test.mjs       # node --test for fire-once confetti logic
  .nojekyll               # GitHub Pages: don't run Jekyll on this plain site
  README.md
```

Visual/animation correctness (does it *look* right, does scrolling feel smooth, does the layout hold on a phone viewport) is verified with the `/browse` skill against the running page, not with unit tests — unit tests in this plan cover only the pure-logic modules (puzzle/wheel/easter-egg/reveal triggering) where correctness can be checked without eyeballing pixels.

---

### Task 1: Project scaffold and base page shell

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/main.js`
- Create: `.nojekyll`
- Create: `README.md`

**Interfaces:**
- Produces: `index.html` with `<section id="cover">`, `<section id="timeline">`, `<section id="reveal">` containers that later tasks fill; `<script type="module" src="js/main.js">` entry point; `css/style.css` linked with a base mobile-first reset and CSS custom properties for the clay/scrapbook color palette (`--color-bg`, `--color-accent`, `--color-paper`, font vars).

- [ ] **Step 1: Create `index.html` with the three section shells**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>给你的生日惊喜</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <section id="cover" class="section">
    <h1 class="cover-title">给你的生日惊喜</h1>
    <button id="start-btn" class="start-btn">点击开始</button>
  </section>

  <section id="timeline" class="section" hidden></section>

  <section id="reveal" class="section" hidden></section>

  <audio id="bg-audio" src="assets/audio/song.mp3" preload="none" loop></audio>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/style.css` with mobile-first reset and palette variables**

```css
:root {
  --color-bg: #fdf6ec;
  --color-paper: #fff9f0;
  --color-accent: #e8927c;
  --color-text: #5a4632;
  --font-hand: "Helvetica", sans-serif; /* swapped for a real handwritten webfont later */
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  overflow-x: hidden;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-hand);
}

.section {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.start-btn {
  margin-top: 24px;
  padding: 12px 28px;
  min-height: 44px;
  min-width: 44px;
  border: none;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font-size: 1rem;
}
```

- [ ] **Step 3: Create `js/main.js` with a no-op entry point**

```js
console.log("birthday site loaded");
```

- [ ] **Step 4: Create `.nojekyll` (empty file) so GitHub Pages serves the site as-is**

```
```

- [ ] **Step 5: Create `README.md`**

```markdown
# Birthday Surprise Site

Static single-page birthday surprise site. Open `index.html` via a local
static server (e.g. `npx serve .`) to preview. See
`docs/superpowers/specs/2026-09-22-birthday-surprise-site-design.md` for
the design.
```

- [ ] **Step 6: Verify the page loads with `/browse`**

Use the `/browse` skill to open `index.html` (via a local static server, e.g. `npx serve .` on a free port) at an iPhone-width viewport and confirm the cover section renders with title and button, no horizontal scroll.

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/main.js .nojekyll README.md
git commit -m "Add base page shell with cover/timeline/reveal sections"
```

---

### Task 2: Content data file with placeholder memory nodes

**Files:**
- Create: `js/content.js`
- Create: `assets/images/placeholder-1.svg` through `placeholder-8.svg` (8 simple placeholder images)

**Interfaces:**
- Consumes: nothing
- Produces: `export const memoryNodes` — array of 8 objects `{ id: string, photos: string[], story: string, detail: string }`; `export const easterEggTexts` — array of 3 strings; `export const wheelOptions` — array of strings for the wheel/flip-card mini-game; `export const letterParagraphs` — array of strings for the reveal letter; `export const giftText` — string for the gift/plan reveal; `export const songPath` — string path to the audio file (`assets/audio/song.mp3`).

- [ ] **Step 1: Create 8 minimal placeholder SVGs**

```bash
for i in 1 2 3 4 5 6 7 8; do
cat > assets/images/placeholder-$i.svg <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="400" height="300" fill="#f0dfc8"/>
  <text x="50%" y="50%" text-anchor="middle" fill="#5a4632" font-size="24">照片占位 $i</text>
</svg>
SVG
done
```

- [ ] **Step 2: Create `js/content.js` with placeholder data**

```js
export const memoryNodes = [
  { id: "node-1", photos: ["assets/images/placeholder-1.svg"], story: "占位故事文字 1：我们第一次见面。", detail: "占位小细节：那天天气很好。" },
  { id: "node-2", photos: ["assets/images/placeholder-2.svg"], story: "占位故事文字 2。", detail: "占位小细节 2。" },
  { id: "node-3", photos: ["assets/images/placeholder-3.svg"], story: "占位故事文字 3。", detail: "占位小细节 3。" },
  { id: "node-4", photos: ["assets/images/placeholder-4.svg"], story: "占位故事文字 4。", detail: "占位小细节 4。" },
  { id: "node-5", photos: ["assets/images/placeholder-5.svg"], story: "占位故事文字 5。", detail: "占位小细节 5。" },
  { id: "node-6", photos: ["assets/images/placeholder-6.svg"], story: "占位故事文字 6。", detail: "占位小细节 6。" },
  { id: "node-7", photos: ["assets/images/placeholder-7.svg"], story: "占位故事文字 7。", detail: "占位小细节 7。" },
  { id: "node-8", photos: ["assets/images/placeholder-8.svg"], story: "占位故事文字 8。", detail: "占位小细节 8。" },
];

export const easterEggTexts = [
  "占位彩蛋文字 1",
  "占位彩蛋文字 2",
  "占位彩蛋文字 3",
];

export const wheelOptions = [
  "我们的第一次牵手",
  "我们的第一次旅行",
  "我们的第一次吵架又和好",
  "我们的第一次一起做饭",
];

export const letterParagraphs = [
  "占位情书文字第一段。",
  "占位情书文字第二段。",
  "占位情书文字第三段。",
];

export const giftText = "占位礼物/旅行计划揭晓文字。";

export const songPath = "assets/audio/song.mp3";
```

- [ ] **Step 3: Verify with Node that the module loads and has 8 nodes**

Run: `node --input-type=module -e "import('./js/content.js').then(m => { if (m.memoryNodes.length !== 8) throw new Error('expected 8 nodes, got ' + m.memoryNodes.length); console.log('OK'); })"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add js/content.js assets/images/
git commit -m "Add placeholder content data for memory nodes and reveal text"
```

---

### Task 3: Timeline rendering with scroll-triggered animation

**Files:**
- Create: `js/scrollAnimate.js`
- Modify: `js/main.js`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `memoryNodes` from `js/content.js` (`{ id, photos, story, detail }`)
- Produces: `export function observeReveal(selector)` in `scrollAnimate.js` — attaches an IntersectionObserver to all elements matching `selector`, adds class `is-visible` once per element when `entry.isIntersecting` is true, and unobserves that element after first trigger (idempotent, no re-trigger on repeated scroll). `main.js` renders one `.memory-node` div per entry in `memoryNodes` into `#timeline`, then calls `observeReveal('.memory-node')`.

- [ ] **Step 1: Create `js/scrollAnimate.js`**

```js
export function observeReveal(selector) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach((el) => observer.observe(el));
  return observer;
}
```

- [ ] **Step 2: Add a Node test proving idempotent single-trigger behavior using a fake IntersectionObserver**

```js
// tests/scrollAnimate.test.mjs
import { test } from "node:test";
import assert from "node:assert";

test("observeReveal adds is-visible once and does not re-observe", async () => {
  const calls = [];
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { calls.push(["observe", el]); }
    unobserve(el) { calls.push(["unobserve", el]); }
  };
  global.document = {
    querySelectorAll: () => [{
      classList: { add: (c) => { div.added = c; } },
    }],
  };
  const div = {};
  const { observeReveal } = await import("../js/scrollAnimate.js");
  const observer = observeReveal(".x");
  observer.cb([{ isIntersecting: true, target: div }], observer);
  assert.strictEqual(div.added, "is-visible");
  observer.cb([{ isIntersecting: true, target: div }], observer);
  assert.strictEqual(calls.filter((c) => c[0] === "unobserve").length, 1);
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `node --test tests/scrollAnimate.test.mjs`
Expected: PASS (1 test)

- [ ] **Step 4: Wire rendering into `js/main.js`**

```js
import { memoryNodes } from "./content.js";
import { observeReveal } from "./scrollAnimate.js";

function renderTimeline() {
  const container = document.getElementById("timeline");
  container.hidden = false;
  container.innerHTML = memoryNodes.map((node) => `
    <div class="memory-node" id="${node.id}">
      <img src="${node.photos[0]}" alt="回忆照片" onerror="this.classList.add('img-fallback')">
      <p class="story">${node.story}</p>
      <p class="detail">${node.detail}</p>
    </div>
  `).join("");
  observeReveal(".memory-node");
}

document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("cover").hidden = true;
  renderTimeline();
}, { once: true });
```

- [ ] **Step 5: Add reveal + fallback CSS to `css/style.css`**

```css
.memory-node {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  max-width: 480px;
  margin-bottom: 48px;
  text-align: center;
}

.memory-node.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.memory-node img {
  max-width: 100%;
  border-radius: 8px;
}

.memory-node img.img-fallback {
  background: var(--color-paper);
  border: 2px dashed var(--color-accent);
  min-height: 150px;
}
```

- [ ] **Step 6: Verify visually with `/browse`**

Open the page, click "点击开始", scroll through the timeline at an iPhone viewport width, confirm each node fades/slides in once as it enters view and doesn't re-trigger on scrolling back up and down again.

- [ ] **Step 7: Commit**

```bash
git add js/scrollAnimate.js js/main.js css/style.css tests/scrollAnimate.test.mjs
git commit -m "Render memory timeline with scroll-triggered reveal animation"
```

---

### Task 4: Puzzle mini-game

**Files:**
- Create: `js/puzzle.js`
- Create: `tests/puzzle.test.mjs`
- Modify: `js/main.js`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: an image path (one of `memoryNodes[i].photos[0]`)
- Produces: `export function shufflePieces(n, seed)` — returns an array of `n` piece-index numbers in a deterministic-for-testing (seeded) shuffled order; `export function isSolved(order)` — returns `true` iff `order` equals `[0, 1, ..., n-1]`; `export function renderPuzzle(container, imagePath, onSolved)` — renders a 3x3 tap-to-swap puzzle into `container`, calling `onSolved()` once when solved.

- [ ] **Step 1: Write failing tests for pure logic**

```js
// tests/puzzle.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { shufflePieces, isSolved } from "../js/puzzle.js";

test("shufflePieces returns all n indices exactly once", () => {
  const order = shufflePieces(9, 42);
  assert.strictEqual(order.length, 9);
  assert.deepStrictEqual([...order].sort((a, b) => a - b), [0,1,2,3,4,5,6,7,8]);
});

test("isSolved is true only for the identity order", () => {
  assert.strictEqual(isSolved([0,1,2,3,4,5,6,7,8]), true);
  assert.strictEqual(isSolved([1,0,2,3,4,5,6,7,8]), false);
});
```

- [ ] **Step 2: Run tests to verify they fail (module doesn't exist yet)**

Run: `node --test tests/puzzle.test.mjs`
Expected: FAIL with a module-not-found error

- [ ] **Step 3: Implement `js/puzzle.js`**

```js
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function shufflePieces(n, seed = Date.now()) {
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = seededRandom(seed);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function isSolved(order) {
  return order.every((v, i) => v === i);
}

export function renderPuzzle(container, imagePath, onSolved) {
  const GRID = 3;
  let order = shufflePieces(GRID * GRID);
  while (isSolved(order)) order = shufflePieces(GRID * GRID); // never start solved
  let selected = null;

  function draw() {
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${GRID}, 1fr)`;
    order.forEach((pieceIndex, slotIndex) => {
      const piece = document.createElement("button");
      const col = pieceIndex % GRID;
      const row = Math.floor(pieceIndex / GRID);
      piece.style.minHeight = "44px";
      piece.style.minWidth = "44px";
      piece.style.backgroundImage = `url(${imagePath})`;
      piece.style.backgroundSize = `${GRID * 100}% ${GRID * 100}%`;
      piece.style.backgroundPosition = `${(col * 100) / (GRID - 1)}% ${(row * 100) / (GRID - 1)}%`;
      piece.dataset.slot = String(slotIndex);
      piece.addEventListener("click", () => onPieceClick(slotIndex));
      container.appendChild(piece);
    });
  }

  function onPieceClick(slotIndex) {
    if (selected === null) {
      selected = slotIndex;
      return;
    }
    [order[selected], order[slotIndex]] = [order[slotIndex], order[selected]];
    selected = null;
    draw();
    if (isSolved(order)) onSolved();
  }

  draw();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/puzzle.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Add a test for the 44px minimum touch target**

```js
// append to tests/puzzle.test.mjs
test("renderPuzzle pieces meet the 44px minimum touch target", async () => {
  global.document = {
    createElement: () => ({ style: {}, dataset: {}, addEventListener: () => {} }),
  };
  const fakeContainer = { style: {}, innerHTML: "", appendChild(el) { this._last = el; } };
  const { renderPuzzle } = await import("../js/puzzle.js");
  renderPuzzle(fakeContainer, "fake.svg", () => {});
  assert.strictEqual(fakeContainer._last.style.minHeight, "44px");
  assert.strictEqual(fakeContainer._last.style.minWidth, "44px");
});
```

Run: `node --test tests/puzzle.test.mjs`
Expected: PASS (3 tests)

- [ ] **Step 6: Wire the puzzle into the timeline in `js/main.js`, after memory node 3**

```js
import { renderPuzzle } from "./puzzle.js";

// inside renderTimeline(), after inserting node markup, before observeReveal call:
const puzzleHost = document.createElement("div");
puzzleHost.className = "puzzle-host";
document.getElementById("node-3").insertAdjacentElement("afterend", puzzleHost);
renderPuzzle(puzzleHost, memoryNodes[3].photos[0], () => {
  puzzleHost.insertAdjacentHTML("beforeend", "<p>拼图完成！</p>");
});
```

- [ ] **Step 7: Add basic grid styling to `css/style.css`**

```css
.puzzle-host {
  width: 240px;
  height: 240px;
  margin: 24px auto;
  gap: 2px;
}
```

- [ ] **Step 8: Verify visually with `/browse`**

Scroll to the puzzle, tap two pieces to swap them, confirm swapping works and a completion message appears once solved.

- [ ] **Step 9: Commit**

```bash
git add js/puzzle.js js/main.js css/style.css tests/puzzle.test.mjs
git commit -m "Add tap-to-swap puzzle mini-game"
```

---

### Task 5: Wheel/flip-card mini-game

**Files:**
- Create: `js/wheel.js`
- Create: `tests/wheel.test.mjs`
- Modify: `js/main.js`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `wheelOptions` from `js/content.js` (`string[]`)
- Produces: `export function pickOption(options, seed)` — returns a deterministic-for-testing index into `options`; `export function renderWheel(container, options, onPicked)` — renders a tap-to-flip card that reveals `options[pickOption(options)]`, calling `onPicked(text)` once.

- [ ] **Step 1: Write failing tests**

```js
// tests/wheel.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { pickOption } from "../js/wheel.js";

test("pickOption returns a valid index into options", () => {
  const options = ["a", "b", "c"];
  const idx = pickOption(options, 7);
  assert.ok(idx >= 0 && idx < options.length);
});

test("pickOption is deterministic for the same seed", () => {
  const options = ["a", "b", "c", "d"];
  assert.strictEqual(pickOption(options, 7), pickOption(options, 7));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/wheel.test.mjs`
Expected: FAIL with a module-not-found error

- [ ] **Step 3: Implement `js/wheel.js`**

```js
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function pickOption(options, seed = Date.now()) {
  const rand = seededRandom(seed);
  return Math.floor(rand() * options.length);
}

export function renderWheel(container, options, onPicked) {
  const card = document.createElement("button");
  card.className = "wheel-card";
  card.style.minHeight = "44px";
  card.style.minWidth = "44px";
  card.textContent = "翻开看看";
  card.addEventListener("click", () => {
    const idx = pickOption(options);
    card.textContent = options[idx];
    card.disabled = true;
    onPicked(options[idx]);
  }, { once: true });
  container.appendChild(card);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/wheel.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Wire into `js/main.js`, after memory node 6**

```js
import { renderWheel } from "./wheel.js";
import { wheelOptions } from "./content.js";

// inside renderTimeline(), after node-3 puzzle wiring:
const wheelHost = document.createElement("div");
wheelHost.className = "wheel-host";
document.getElementById("node-6").insertAdjacentElement("afterend", wheelHost);
renderWheel(wheelHost, wheelOptions, () => {});
```

- [ ] **Step 6: Add styling to `css/style.css`**

```css
.wheel-host { margin: 24px auto; text-align: center; }
.wheel-card {
  padding: 16px 24px;
  border-radius: 12px;
  border: 2px dashed var(--color-accent);
  background: var(--color-paper);
}
```

- [ ] **Step 7: Verify visually with `/browse`**

Scroll to the wheel card, tap it, confirm it reveals one of the option strings and becomes disabled after one tap.

- [ ] **Step 8: Commit**

```bash
git add js/wheel.js js/main.js css/style.css tests/wheel.test.mjs
git commit -m "Add flip-card wheel mini-game"
```

---

### Task 6: Click-to-find easter eggs

**Files:**
- Create: `js/easterEggs.js`
- Create: `tests/easterEggs.test.mjs`
- Modify: `js/main.js`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `easterEggTexts` from `js/content.js` (`string[]`)
- Produces: `export const MIN_HIT_AREA_PX` (numeric constant, `44`); `export function scatterEggs(container, texts)` — appends one clickable icon per text at randomized positions within `container`, each `MIN_HIT_AREA_PX` square, which on click reveals `texts[i]` in a tooltip/popup and is removed from further clicks.

- [ ] **Step 1: Write failing tests**

```js
// tests/easterEggs.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { MIN_HIT_AREA_PX, scatterEggs } from "../js/easterEggs.js";

test("MIN_HIT_AREA_PX meets iOS tap target guidance", () => {
  assert.ok(MIN_HIT_AREA_PX >= 44);
});

test("scatterEggs creates one element per text with the min hit area", () => {
  global.document = {
    createElement: () => ({ style: {}, addEventListener: () => {} }),
  };
  const created = [];
  const fakeContainer = { appendChild(el) { created.push(el); } };
  scatterEggs(fakeContainer, ["a", "b", "c"]);
  assert.strictEqual(created.length, 3);
  created.forEach((el) => {
    assert.strictEqual(el.style.minWidth, `${MIN_HIT_AREA_PX}px`);
    assert.strictEqual(el.style.minHeight, `${MIN_HIT_AREA_PX}px`);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/easterEggs.test.mjs`
Expected: FAIL with a module-not-found error

- [ ] **Step 3: Implement `js/easterEggs.js`**

```js
export const MIN_HIT_AREA_PX = 44;

export function scatterEggs(container, texts) {
  texts.forEach((text) => {
    const icon = document.createElement("button");
    icon.className = "easter-egg";
    icon.textContent = "💛";
    icon.style.minWidth = `${MIN_HIT_AREA_PX}px`;
    icon.style.minHeight = `${MIN_HIT_AREA_PX}px`;
    icon.style.position = "absolute";
    icon.style.left = `${Math.random() * 80}%`;
    icon.style.top = `${Math.random() * 80}%`;
    icon.addEventListener("click", () => {
      icon.replaceWith(document.createTextNode(text));
    }, { once: true });
    container.appendChild(icon);
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/easterEggs.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Wire into `js/main.js`**

```js
import { scatterEggs } from "./easterEggs.js";
import { easterEggTexts } from "./content.js";

// inside renderTimeline(), after other wiring:
const timelineEl = document.getElementById("timeline");
timelineEl.style.position = "relative";
scatterEggs(timelineEl, easterEggTexts);
```

- [ ] **Step 6: Add styling to `css/style.css`**

```css
.easter-egg {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  z-index: 5;
}
```

- [ ] **Step 7: Verify visually with `/browse`**

Scroll through the timeline, find and tap the scattered icons, confirm each reveals its text once and disappears as an icon afterward.

- [ ] **Step 8: Commit**

```bash
git add js/easterEggs.js js/main.js css/style.css tests/easterEggs.test.mjs
git commit -m "Add click-to-find easter eggs scattered across the timeline"
```

---

### Task 7: Reveal section — letter, gift, confetti (fire-once)

**Files:**
- Create: `js/reveal.js`
- Create: `tests/reveal.test.mjs`
- Modify: `js/main.js`
- Modify: `index.html`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `letterParagraphs`, `giftText` from `js/content.js`
- Produces: `export function renderReveal(container, letterParagraphs, giftText, triggerConfetti)` — renders paragraphs with a staggered fade-in, then the gift text, then calls `triggerConfetti()` exactly once even if `renderReveal` were somehow invoked twice (guarded by an internal fired flag). Confetti itself is invoked via `window.confetti` (loaded from CDN in `index.html`), so `reveal.js` takes it as an injected `triggerConfetti` function to stay testable without a browser or canvas.

- [ ] **Step 1: Write failing test for fire-once behavior**

```js
// tests/reveal.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { renderReveal } from "../js/reveal.js";

test("renderReveal triggers confetti exactly once across repeated calls", () => {
  global.document = {
    createElement: () => ({ style: {}, classList: { add() {} }, appendChild() {} }),
  };
  const fakeContainer = { innerHTML: "", appendChild() {}, hidden: true };
  let calls = 0;
  renderReveal(fakeContainer, ["p1", "p2"], "gift", () => { calls++; });
  renderReveal(fakeContainer, ["p1", "p2"], "gift", () => { calls++; });
  assert.strictEqual(calls, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/reveal.test.mjs`
Expected: FAIL with a module-not-found error

- [ ] **Step 3: Implement `js/reveal.js`**

```js
let confettiFired = false;

export function renderReveal(container, letterParagraphs, giftText, triggerConfetti) {
  container.hidden = false;
  container.innerHTML = letterParagraphs.map((p, i) =>
    `<p class="letter-p" style="animation-delay:${i * 0.6}s">${p}</p>`
  ).join("") + `<p class="gift-text">${giftText}</p>`;

  if (!confettiFired) {
    confettiFired = true;
    triggerConfetti();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/reveal.test.mjs`
Expected: PASS (1 test)

- [ ] **Step 5: Load canvas-confetti from CDN in `index.html`**

```html
<!-- add before the closing </body>, before the module script -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
```

- [ ] **Step 6: Wire into `js/main.js`, triggered after the last memory node's animation completes**

```js
import { renderReveal } from "./reveal.js";
import { letterParagraphs, giftText } from "./content.js";

// After observeReveal(".memory-node") call in renderTimeline(), observe the last node
// and render the reveal section once it becomes visible:
const lastNode = document.getElementById(memoryNodes[memoryNodes.length - 1].id);
lastNode.addEventListener("transitionend", () => {
  renderReveal(document.getElementById("reveal"), letterParagraphs, giftText, () => {
    window.confetti && window.confetti({ particleCount: 150, spread: 70 });
  });
}, { once: true });
```

- [ ] **Step 7: Add styling to `css/style.css`**

```css
.letter-p {
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;
  max-width: 480px;
  margin-bottom: 12px;
  text-align: center;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.gift-text {
  margin-top: 24px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}
```

- [ ] **Step 8: Verify visually with `/browse`**

Scroll to the end of the timeline, confirm the letter paragraphs fade in one after another, the gift text appears, and confetti fires once (scroll back up and down again to confirm it does not fire a second time).

- [ ] **Step 9: Commit**

```bash
git add js/reveal.js js/main.js index.html css/style.css tests/reveal.test.mjs
git commit -m "Add reveal section with letter animation, gift text, and one-time confetti"
```

---

### Task 8: Gesture-gated background audio

**Files:**
- Create: `js/audio.js`
- Modify: `js/main.js`
- Create placeholder: `assets/audio/song.mp3` (short silent placeholder, swapped later with the real song)

**Interfaces:**
- Consumes: `#bg-audio` element from `index.html`, `songPath` from `js/content.js`
- Produces: `export function armAudioOnFirstGesture(audioEl)` — attaches a one-time `click` listener on `document` that calls `audioEl.play()` inside that same event handler (required for iOS/WeChat gesture-gated autoplay), then removes itself.

- [ ] **Step 1: Create a short placeholder silent audio file**

```bash
mkdir -p assets/audio
# 1 second of silence as a placeholder mp3-shaped file; real song swapped in later
printf '' > assets/audio/song.mp3
```

- [ ] **Step 2: Implement `js/audio.js`**

```js
export function armAudioOnFirstGesture(audioEl) {
  function onFirstClick() {
    audioEl.play().catch(() => {
      // Swallow rejection: file may be a placeholder with no real audio yet.
    });
    document.removeEventListener("click", onFirstClick);
  }
  document.addEventListener("click", onFirstClick, { once: true });
}
```

- [ ] **Step 3: Wire into `js/main.js`, armed as early as possible (before the first render)**

```js
import { armAudioOnFirstGesture } from "./audio.js";

armAudioOnFirstGesture(document.getElementById("bg-audio"));
```

- [ ] **Step 4: Write a Node test confirming `play()` is called synchronously inside the click handler**

```js
// tests/audio.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { armAudioOnFirstGesture } from "../js/audio.js";

test("armAudioOnFirstGesture calls play() on first document click", () => {
  const listeners = {};
  global.document = {
    addEventListener: (evt, cb) => { listeners[evt] = cb; },
    removeEventListener: () => {},
  };
  let played = false;
  const fakeAudio = { play: () => { played = true; return Promise.resolve(); } };
  armAudioOnFirstGesture(fakeAudio);
  listeners.click();
  assert.strictEqual(played, true);
});
```

Run: `node --test tests/audio.test.mjs`
Expected: PASS (1 test)

- [ ] **Step 5: Verify manually with `/browse`**

Open the page, click "点击开始" (the first click on the page), confirm the audio element's `play()` is invoked (check via browser dev tools / network tab that the audio file is requested) without any autoplay-blocked warning in the console.

- [ ] **Step 6: Commit**

```bash
git add js/audio.js js/main.js assets/audio/song.mp3 tests/audio.test.mjs
git commit -m "Add gesture-gated background audio playback"
```

---

### Task 9: GitHub Pages deployment

**Files:**
- Modify: `README.md`
- No code changes — configuration/deployment task

**Interfaces:**
- Consumes: the complete static site from Tasks 1-8
- Produces: a public GitHub Pages URL serving `index.html`

- [ ] **Step 1: Create the GitHub repository (ask the user for the desired repo name/visibility if not already decided) and push**

```bash
git remote add origin <repo-url>
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Enable GitHub Pages for the repo (Settings → Pages → Source: `main` branch, `/` root) via `gh` if available**

```bash
gh api repos/:owner/:repo/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

- [ ] **Step 3: Wait for the Pages build and fetch the live URL**

```bash
gh api repos/:owner/:repo/pages --jq .html_url
```

- [ ] **Step 4: Verify the live URL with `/browse` at an iPhone viewport width**

Open the returned Pages URL, click through the full flow (cover → timeline → puzzle → wheel → easter eggs → reveal → confetti), confirm it matches local testing with no broken asset paths (a common GitHub Pages gotcha is relative-path issues — none expected here since all paths in this plan are relative to `index.html`).

- [ ] **Step 5: Update `README.md` with the live URL**

```markdown
## Live site

<paste the html_url from Step 3 here>
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "Document live GitHub Pages URL"
git push
```

---

## After This Plan

Replace every placeholder in `js/content.js` (photos, story text, easter-egg text, letter text, gift text) and `assets/audio/song.mp3` (real song file) with real material, then re-verify the full flow with `/browse` and push. No structural or animation code needs to change for this swap — that is the point of centralizing content in `js/content.js`.
