import { memoryNodes, letterParagraphs, giftText, giftClues, songPath } from "./content.js";
import { buildCardSequence } from "./cardSequence.js";
import { decideSwipe } from "./swipeDecision.js";
import { buildLetterHTML, buildGiftHTML, triggerConfettiOnce } from "./reveal.js";
import { buildTrayState, pickNudgeMessage } from "./collectibles.js";
import { armAudioOnFirstGesture } from "./audio.js";
import { initAmbientEffect } from "./ambientEffects.js";

const bgAudio = document.getElementById("bg-audio");
bgAudio.src = songPath;
armAudioOnFirstGesture(bgAudio);

const cards = buildCardSequence({ memoryNodes, letterParagraphs, giftText });
const stack = document.getElementById("card-stack");
let currentIndex = 0;
const collectedClueIds = [];
let nudgeCount = 0;
let nudgeTimer = null;

function collectClue(clueId, clueEl) {
  if (collectedClueIds.includes(clueId)) return;
  collectedClueIds.push(clueId);
  if (clueEl) clueEl.classList.add("collected");
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

// For a clue that's already painted into a scene (e.g. a strawberry among
// dozens in strawberry-farm.jpg, once giftClues gets a `hotspot`/`target`
// again): an invisible tap target sits right on top of it, and tapping
// flies a small copy of the clue icon from that spot to wherever it
// "belongs" in the same picture before it joins the tray — the artwork
// itself can't be edited, but the pick-up motion sells the interaction.
// Currently unused (giftClues has no hotspot yet) — reactivates as soon
// as a clue entry gets one.
function attachHotspotClue(hostEl, clue) {
  const hotspot = document.createElement("button");
  hotspot.className = "clue-hotspot";
  hotspot.style.left = clue.hotspot.x;
  hotspot.style.top = clue.hotspot.y;
  hotspot.setAttribute("aria-label", "线索");
  hostEl.appendChild(hotspot);

  hotspot.addEventListener("click", () => {
    const hostRect = hostEl.getBoundingClientRect();
    const startX = (parseFloat(clue.hotspot.x) / 100) * hostRect.width;
    const startY = (parseFloat(clue.hotspot.y) / 100) * hostRect.height;
    const endX = (parseFloat(clue.target.x) / 100) * hostRect.width;
    const endY = (parseFloat(clue.target.y) / 100) * hostRect.height;

    const flyer = document.createElement("img");
    flyer.src = clue.icon;
    flyer.className = "flying-clue";
    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    hostEl.appendChild(flyer);
    hotspot.remove();

    requestAnimationFrame(() => {
      const dx = endX - startX;
      const dy = endY - startY;
      flyer.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.3)`;
      flyer.style.opacity = "0";
    });
    flyer.addEventListener("transitionend", () => {
      flyer.remove();
      collectClue(clue.id);
    }, { once: true });
  }, { once: true });
}

function buildCardElement(card, index) {
  const el = document.createElement("div");
  el.className = "card";
  el.style.setProperty("--card-accent", `var(--${card.accent})`);
  el.hidden = index !== 0;

  if (card.kind === "memory") {
    el.classList.add("has-photo");
    // Illustrations are pre-cropped to near-phone aspect ratio, so a plain
    // cover-fit fills the screen with negligible cropping.
    el.innerHTML = `
      <img class="card-bg-photo" src="${card.photo}" alt="回忆照片" onerror="this.classList.add('img-fallback')">
      ${card.effect ? `<canvas class="ambient-fx"></canvas>` : ""}
      ${card.text ? `<div class="card-text-overlay"><p class="card-story">${card.text}</p></div>` : ""}
    `;
    // Deferred to first activation (see activateCard), not started here:
    // every card is built up front while #card-stack is still hidden, so
    // the canvas would measure 0x0 (display:none collapses clientWidth/
    // Height) if initialized immediately.
    if (card.clue && card.clue.hotspot) {
      attachHotspotClue(el, card.clue);
    } else if (card.clue && card.clue.pos) {
      const clueBtn = document.createElement("button");
      clueBtn.className = `clue-item pos-${card.clue.pos}`;
      clueBtn.innerHTML = `<img src="${card.clue.icon}" alt="线索">`;
      clueBtn.addEventListener("click", () => collectClue(card.clue.id, clueBtn), { once: true });
      el.appendChild(clueBtn);
    }
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

function activateCard(index) {
  const card = cards[index];
  if (card.effect && !card.effectStarted) {
    card.effectStarted = true;
    initAmbientEffect(cardEls[index].querySelector(".ambient-fx"), card.effect);
  }
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

const audioToggle = document.getElementById("audio-toggle");
audioToggle.addEventListener("click", () => {
  bgAudio.muted = !bgAudio.muted;
  audioToggle.textContent = bgAudio.muted ? "🔇" : "🎵";
});

document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("cover").hidden = true;
  stack.hidden = false;
  audioToggle.hidden = false;
  activateCard(0);
}, { once: true });
