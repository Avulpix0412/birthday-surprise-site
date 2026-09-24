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

// A clue provided as two separate elements (e.g. a strawberry + the
// basket already in her hand in the photo): drag the item onto the
// basket to collect it. One successful drop is enough — the item then
// locks into the basket and stops being draggable; a missed drop snaps
// back to its start position so the page stays completable no matter how
// many tries it takes.
function attachDragClue(hostEl, clue) {
  const { drag } = clue;

  const basket = document.createElement("img");
  basket.src = drag.basketIcon;
  basket.className = "drag-basket";
  basket.style.left = drag.basketPos.x;
  basket.style.top = drag.basketPos.y;
  basket.style.width = drag.basketSize;
  hostEl.appendChild(basket);

  const item = document.createElement("img");
  item.src = drag.itemIcon;
  item.className = "drag-item";
  item.style.left = drag.itemPos.x;
  item.style.top = drag.itemPos.y;
  item.style.width = drag.itemSize;
  item.setAttribute("alt", "线索");
  hostEl.appendChild(item);

  // A one-time hint bubble, gone the instant she touches the item — she
  // only needs telling once that it's draggable, not a permanent label.
  const hint = document.createElement("div");
  hint.className = "drag-hint";
  hint.style.left = drag.itemPos.x;
  hint.style.top = drag.itemPos.y;
  hint.textContent = drag.hintText || "拖我到篮子里";
  hostEl.appendChild(hint);

  let itemDrag = null;

  item.addEventListener("pointerdown", (e) => {
    e.stopPropagation(); // don't let #card-stack's swipe handler see this
    hint.remove();
    const rect = item.getBoundingClientRect();
    itemDrag = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      originCenterX: rect.left + rect.width / 2,
      originCenterY: rect.top + rect.height / 2,
      dx: 0,
      dy: 0,
    };
    item.classList.add("dragging");
    item.setPointerCapture(e.pointerId);
  });

  item.addEventListener("pointermove", (e) => {
    if (!itemDrag) return;
    e.stopPropagation();
    itemDrag.dx = e.clientX - itemDrag.startClientX;
    itemDrag.dy = e.clientY - itemDrag.startClientY;
    item.style.transform = `translate(calc(-50% + ${itemDrag.dx}px), calc(-50% + ${itemDrag.dy}px))`;
  });

  function endItemDrag(e) {
    if (!itemDrag) return;
    e.stopPropagation();
    // Keep .dragging (animation: none) through the settle transition below —
    // the idle-bob keyframe would otherwise fight the transform transition
    // for the same property, since a running CSS animation overrides even
    // an inline style on the property it animates.

    const basketRect = basket.getBoundingClientRect();
    const basketCenter = { x: basketRect.left + basketRect.width / 2, y: basketRect.top + basketRect.height / 2 };
    const currentCenter = { x: itemDrag.originCenterX + itemDrag.dx, y: itemDrag.originCenterY + itemDrag.dy };
    const dist = Math.hypot(currentCenter.x - basketCenter.x, currentCenter.y - basketCenter.y);
    const threshold = Math.max(basketRect.width, basketRect.height) * 0.6;

    // A timeout (not `transitionend`) drives what happens after the settle
    // animation: if the drop lands exactly on the snap target, the computed
    // transform string never actually changes value, so no transition runs
    // and `transitionend` would never fire.
    item.style.transition = "transform 0.3s ease";
    if (dist < threshold) {
      const finalDx = basketCenter.x - itemDrag.originCenterX;
      const finalDy = basketCenter.y - itemDrag.originCenterY;
      item.style.transform = `translate(calc(-50% + ${finalDx}px), calc(-50% + ${finalDy}px)) scale(0.55)`;
      setTimeout(() => {
        item.style.pointerEvents = "none";
        collectClue(clue.id);
      }, 300);
    } else {
      item.style.transform = "translate(-50%, -50%)";
      setTimeout(() => {
        item.classList.remove("dragging");
      }, 300);
    }
    itemDrag = null;
  }

  item.addEventListener("pointerup", endItemDrag);
  item.addEventListener("pointercancel", endItemDrag);
}

// A clue where the "target" isn't another image but a point in the scene:
// a pulsing dashed ring at `targetPos` marks where to drop the camera —
// aimed at her neck/collar, not her face. Dropping inside it takes the
// photo — a shutter flash plays, the background photo swaps to a
// same-composition eyes-closed version the user provided for a beat, then
// back — and the camera settles at `restPos`, low and enlarged, reading
// as an off-screen photographer's own hands rather than an object glued
// to her body. A miss snaps back to the corner, same completability
// guarantee as attachDragClue.
function attachPhotoShootClue(hostEl, clue) {
  const { photoShoot: shot } = clue;
  const bgPhoto = hostEl.querySelector(".card-bg-photo");

  const ring = document.createElement("div");
  ring.className = "aim-ring";
  ring.style.left = shot.targetPos.x;
  ring.style.top = shot.targetPos.y;
  ring.style.width = `${parseFloat(shot.targetRadius) * 2}%`;
  hostEl.appendChild(ring);

  const hint = document.createElement("div");
  hint.className = "drag-hint";
  hint.style.left = shot.cameraPos.x;
  hint.style.top = shot.cameraPos.y;
  hint.textContent = shot.hintText || "给我拍张照吧";
  hostEl.appendChild(hint);

  const camera = document.createElement("img");
  camera.src = shot.cameraIcon;
  camera.className = "drag-item";
  camera.style.left = shot.cameraPos.x;
  camera.style.top = shot.cameraPos.y;
  camera.style.width = shot.cameraSize;
  camera.setAttribute("alt", "线索");
  hostEl.appendChild(camera);

  function takePhoto() {
    const flash = document.createElement("div");
    flash.className = "shutter-flash";
    hostEl.appendChild(flash);
    flash.addEventListener("animationend", () => flash.remove(), { once: true });

    bgPhoto.src = shot.blinkPhoto;
    setTimeout(() => {
      bgPhoto.src = shot.normalPhoto;
    }, 320);

    collectClue(clue.id);
  }

  let camDrag = null;

  camera.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    hint.remove();
    const rect = camera.getBoundingClientRect();
    camDrag = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      originCenterX: rect.left + rect.width / 2,
      originCenterY: rect.top + rect.height / 2,
      dx: 0,
      dy: 0,
    };
    camera.classList.add("dragging");
    camera.setPointerCapture(e.pointerId);
  });

  camera.addEventListener("pointermove", (e) => {
    if (!camDrag) return;
    e.stopPropagation();
    camDrag.dx = e.clientX - camDrag.startClientX;
    camDrag.dy = e.clientY - camDrag.startClientY;
    camera.style.transform = `translate(calc(-50% + ${camDrag.dx}px), calc(-50% + ${camDrag.dy}px))`;
  });

  function endCamDrag(e) {
    if (!camDrag) return;
    e.stopPropagation();

    const hostRect = hostEl.getBoundingClientRect();
    const targetCenter = {
      x: hostRect.left + (parseFloat(shot.targetPos.x) / 100) * hostRect.width,
      y: hostRect.top + (parseFloat(shot.targetPos.y) / 100) * hostRect.height,
    };
    const currentCenter = { x: camDrag.originCenterX + camDrag.dx, y: camDrag.originCenterY + camDrag.dy };
    const dist = Math.hypot(currentCenter.x - targetCenter.x, currentCenter.y - targetCenter.y);
    const threshold = (parseFloat(shot.targetRadius) / 100) * hostRect.width;

    // See attachDragClue for why this is a timeout, not `transitionend`.
    camera.style.transition = "transform 0.3s ease";
    if (dist < threshold) {
      // Settle at restPos (an off-screen photographer's own hands), not at
      // the aim point itself — she's being photographed from a distance.
      const restCenter = {
        x: hostRect.left + (parseFloat(shot.restPos.x) / 100) * hostRect.width,
        y: hostRect.top + (parseFloat(shot.restPos.y) / 100) * hostRect.height,
      };
      const finalDx = restCenter.x - camDrag.originCenterX;
      const finalDy = restCenter.y - camDrag.originCenterY;
      const restScale = parseFloat(shot.restSize) / parseFloat(shot.cameraSize);
      camera.style.transform = `translate(calc(-50% + ${finalDx}px), calc(-50% + ${finalDy}px)) scale(${restScale})`;
      ring.classList.add("fade-out");
      setTimeout(() => {
        camera.style.pointerEvents = "none";
        takePhoto();
      }, 300);
    } else {
      camera.style.transform = "translate(-50%, -50%)";
      setTimeout(() => {
        camera.classList.remove("dragging");
      }, 300);
    }
    camDrag = null;
  }

  camera.addEventListener("pointerup", endCamDrag);
  camera.addEventListener("pointercancel", endCamDrag);
}

// A clue made of several separately-provided sprigs scattered over the
// scene: tap each one to "pick" it (a scale+fade pop, no drag — six drags
// would be tedious for one page), a small progress pill counts them down,
// and once all are picked, the fully assembled bouquet image fades in as
// the page's payoff.
function attachBouquetClue(hostEl, clue) {
  const { bouquet } = clue;
  const total = bouquet.items.length;
  let picked = 0;

  const progress = document.createElement("div");
  progress.className = "bouquet-progress";
  progress.textContent = `0 / ${total}`;
  hostEl.appendChild(progress);

  function showReveal() {
    const overlay = document.createElement("div");
    overlay.className = "bouquet-reveal";
    overlay.innerHTML = `
      <div class="card-glass bouquet-reveal-card">
        <img class="bouquet-reveal-img" src="${bouquet.resultImage}" alt="花束">
      </div>
    `;
    hostEl.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("visible"));
    window.confetti && window.confetti({ particleCount: 130, spread: 80 });
    collectClue(clue.id);
  }

  bouquet.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "bouquet-item";
    btn.style.left = item.pos.x;
    btn.style.top = item.pos.y;
    btn.style.width = item.size;
    btn.innerHTML = `<img src="${item.icon}" alt="花">`;
    hostEl.appendChild(btn);

    btn.addEventListener("click", () => {
      btn.classList.add("picked");
      picked++;
      progress.textContent = `${picked} / ${total}`;
      setTimeout(() => btn.remove(), 500);
      if (picked === total) {
        setTimeout(showReveal, 500);
      }
    }, { once: true });
  });
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
    if (card.clue && card.clue.drag) {
      attachDragClue(el, card.clue);
    } else if (card.clue && card.clue.photoShoot) {
      attachPhotoShootClue(el, card.clue);
    } else if (card.clue && card.clue.bouquet) {
      attachBouquetClue(el, card.clue);
    } else if (card.clue && card.clue.hotspot) {
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
