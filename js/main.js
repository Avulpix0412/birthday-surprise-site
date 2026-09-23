import { memoryNodes, easterEggTexts, wheelOptions, letterParagraphs, giftText, giftClues, songPath } from "./content.js";
import { buildCardSequence } from "./cardSequence.js";
import { decideSwipe } from "./swipeDecision.js";
import { computePathPositions } from "./pathMap.js";
import { renderPuzzle } from "./puzzle.js";
import { renderWheel } from "./wheel.js";
import { attachEgg } from "./easterEggs.js";
import { buildLetterHTML, buildGiftHTML, triggerConfettiOnce } from "./reveal.js";
import { buildTrayState, pickNudgeMessage } from "./collectibles.js";
import { armAudioOnFirstGesture } from "./audio.js";

const bgAudio = document.getElementById("bg-audio");
bgAudio.src = songPath;
armAudioOnFirstGesture(bgAudio);

const cards = buildCardSequence({ memoryNodes, easterEggTexts, wheelOptions, letterParagraphs, giftText, giftClues });
const stack = document.getElementById("card-stack");
let currentIndex = 0;
const collectedClueIds = [];
let nudgeCount = 0;
let nudgeTimer = null;

// Each third of the journey washes the shared garden pattern with a
// different soft tint, echoing Litsee's "choose the world" chapters.
const CHAPTER_TINT = [
  "transparent",                 // chapter 0: as-drawn (the camera/adventure stretch)
  "rgba(217, 72, 79, 0.14)",     // chapter 1: warm rose wash — the strawberry stretch
  "rgba(151, 114, 194, 0.16)",   // chapter 2: violet wash — the necklace/finale stretch
];

function applyChapterTheme(chapter) {
  document.documentElement.style.setProperty("--chapter-tint-color", CHAPTER_TINT[chapter] || CHAPTER_TINT[0]);
}

function collectClue(clueId, clueEl) {
  if (collectedClueIds.includes(clueId)) return;
  collectedClueIds.push(clueId);
  clueEl.classList.add("collected");
  renderTray();
}

function renderTray() {
  const tray = document.getElementById("clue-tray");
  tray.hidden = false;
  const state = buildTrayState(giftClues, collectedClueIds);
  tray.innerHTML = state.map((s) =>
    `<div class="tray-slot ${s.collected ? "" : "empty"}">${s.collected ? `<img src="${s.icon}" alt="">` : ""}</div>`
  ).join("");
}

function showNudge(missedClueId) {
  const toast = document.getElementById("nudge-toast");
  toast.textContent = pickNudgeMessage(nudgeCount);
  nudgeCount++;
  toast.classList.add("visible");
  clearTimeout(nudgeTimer);
  nudgeTimer = setTimeout(() => toast.classList.remove("visible"), 2500);

  const slotIndex = giftClues.findIndex((c) => c.id === missedClueId);
  const slot = document.querySelectorAll("#clue-tray .tray-slot")[slotIndex];
  if (slot) {
    slot.classList.remove("pulse");
    void slot.offsetWidth; // restart animation if already mid-pulse
    slot.classList.add("pulse");
  }
}

function buildCardElement(card, index) {
  const el = document.createElement("div");
  el.className = "card";
  el.style.setProperty("--card-accent", `var(--${card.accent})`);
  el.hidden = index !== 0;

  if (card.kind === "memory") {
    el.innerHTML = `
      <img class="card-photo" src="${card.photo}" alt="回忆照片" onerror="this.classList.add('img-fallback')">
      <div class="card-glass"><p class="card-story">${card.text}</p></div>
    `;
    if (card.eggText) attachEgg(el, card.eggText);
    if (card.clue) {
      const clueBtn = document.createElement("button");
      clueBtn.className = `clue-item pos-${card.clue.pos}`;
      clueBtn.innerHTML = `<img src="${card.clue.icon}" alt="线索">`;
      clueBtn.addEventListener("click", () => collectClue(card.clue.id, clueBtn), { once: true });
      el.appendChild(clueBtn);
    }
  } else if (card.kind === "puzzle") {
    el.innerHTML = `<div class="card-glass"><p class="card-story">拼一拼，找回这段回忆</p></div><div class="puzzle-host"></div>`;
    const host = el.querySelector(".puzzle-host");
    renderPuzzle(host, card.photo, () => {
      host.insertAdjacentHTML("afterend", '<p class="puzzle-solved-msg">拼图完成！</p>');
    });
  } else if (card.kind === "wheel") {
    el.innerHTML = `<div class="card-glass"><p class="card-story">转一转，看看是哪个"第一次"</p></div>`;
    const wheelHost = document.createElement("div");
    wheelHost.className = "wheel-host";
    el.appendChild(wheelHost);
    renderWheel(wheelHost, card.options, () => {});
  } else if (card.kind === "letter") {
    el.innerHTML = `<div class="card-glass">${buildLetterHTML(card.paragraphs)}</div>`;
  } else if (card.kind === "gift") {
    el.innerHTML = `<div class="card-glass">${buildGiftHTML(card.text)}</div>`;
  }

  const tapPrev = document.createElement("div");
  tapPrev.className = "tap-zone prev";
  const tapNext = document.createElement("div");
  tapNext.className = "tap-zone next";
  el.appendChild(tapPrev);
  el.appendChild(tapNext);
  tapPrev.addEventListener("click", () => { if (currentIndex > 0) goTo(currentIndex - 1, "prev"); });
  tapNext.addEventListener("click", () => { if (currentIndex < cards.length - 1) goTo(currentIndex + 1, "next"); });

  return el;
}

const cardEls = cards.map((card, i) => {
  const el = buildCardElement(card, i);
  stack.appendChild(el);
  return el;
});

function renderPathMap() {
  const svg = document.getElementById("path-map");
  const points = computePathPositions(cards.length, 400, 40);
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const circles = points.map((p, i) => {
    const r = i === currentIndex ? 6 : 4;
    const cls = i === currentIndex ? "current" : "";
    return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="var(--${cards[i].accent})" class="${cls}"></circle>`;
  }).join("");
  svg.innerHTML = `<path d="${pathD}" fill="none" stroke="var(--text-lt)" stroke-width="1.5" opacity="0.4"></path>${circles}`;
}

function activateCard(index) {
  const card = cards[index];
  applyChapterTheme(card.chapter);
  if (card.kind === "gift") {
    const glass = cardEls[index].querySelector(".card-glass");
    const collected = buildTrayState(giftClues, collectedClueIds).filter((s) => s.collected);
    const recapHTML = collected.length
      ? `<div class="clue-recap">${collected.map((s) => `<img src="${s.icon}" alt="">`).join("")}</div>`
      : "";
    glass.innerHTML = recapHTML + buildGiftHTML(card.text);
    triggerConfettiOnce(() => {
      window.confetti && window.confetti({ particleCount: 150, spread: 70 });
    });
  }
}

function goTo(newIndex, direction) {
  if (newIndex < 0 || newIndex >= cards.length) return;

  const outgoingCard = cards[currentIndex];
  if (outgoingCard.clue && !collectedClueIds.includes(outgoingCard.clue.id)) {
    showNudge(outgoingCard.clue.id);
  }

  const outgoing = cardEls[currentIndex];
  const incoming = cardEls[newIndex];

  incoming.classList.add("is-dragging");
  incoming.hidden = false;
  incoming.style.transform = direction === "next" ? "translateX(100%)" : "translateX(-100%)";
  void incoming.offsetHeight; // force reflow before re-enabling transition
  incoming.classList.remove("is-dragging");
  outgoing.classList.remove("is-dragging");

  requestAnimationFrame(() => {
    outgoing.style.transform = direction === "next" ? "translateX(-100%)" : "translateX(100%)";
    incoming.style.transform = "translateX(0)";
  });

  outgoing.addEventListener("transitionend", function handler() {
    outgoing.hidden = true;
    outgoing.style.transform = "";
    outgoing.removeEventListener("transitionend", handler);
  });

  currentIndex = newIndex;
  renderPathMap();
  activateCard(currentIndex);
}

let dragState = null;

stack.addEventListener("pointerdown", (e) => {
  dragState = { startX: e.clientX, startTime: Date.now(), el: cardEls[currentIndex], deltaX: 0 };
  dragState.el.classList.add("is-dragging");
});

stack.addEventListener("pointermove", (e) => {
  if (!dragState) return;
  dragState.deltaX = e.clientX - dragState.startX;
  dragState.el.style.transform = `translateX(${dragState.deltaX}px) rotate(${dragState.deltaX / 20}deg)`;
});

function endDrag() {
  if (!dragState) return;
  const { el, deltaX, startTime } = dragState;
  const elapsed = Math.max(1, Date.now() - startTime);
  const velocity = deltaX / elapsed;
  const decision = decideSwipe({ deltaX, velocity, width: stack.clientWidth });
  el.classList.remove("is-dragging");

  if (decision === "next" && currentIndex < cards.length - 1) {
    goTo(currentIndex + 1, "next");
  } else if (decision === "prev" && currentIndex > 0) {
    goTo(currentIndex - 1, "prev");
  } else {
    el.style.transform = "translateX(0)";
  }
  dragState = null;
}

stack.addEventListener("pointerup", endDrag);
stack.addEventListener("pointercancel", endDrag);

document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("cover").hidden = true;
  stack.hidden = false;
  renderTray();
  renderPathMap();
  activateCard(0);
}, { once: true });
