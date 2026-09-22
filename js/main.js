import { memoryNodes, wheelOptions, easterEggTexts, letterParagraphs, giftText, songPath } from "./content.js";
import { observeReveal } from "./scrollAnimate.js";
import { renderPuzzle } from "./puzzle.js";
import { renderWheel } from "./wheel.js";
import { scatterEggs } from "./easterEggs.js";
import { renderReveal, armRevealAnimation } from "./reveal.js";
import { armAudioOnFirstGesture } from "./audio.js";

const bgAudio = document.getElementById("bg-audio");
bgAudio.src = songPath;
armAudioOnFirstGesture(bgAudio);

function renderTimeline() {
  const container = document.getElementById("timeline");
  container.hidden = false;
  container.innerHTML = memoryNodes.map((node) => `
    <div class="memory-node" id="${node.id}">
      <div class="photo-strip">
        ${node.photos.map((src) => `<img src="${src}" class="photo-strip-img" alt="回忆照片" onerror="this.classList.add('img-fallback')">`).join("")}
      </div>
      <p class="story">${node.story}</p>
      <p class="detail">${node.detail}</p>
    </div>
  `).join("");

  const nodeEls = container.querySelectorAll(".memory-node");

  const PUZZLE_AFTER_NODE_INDEX = 2;
  const puzzleHost = document.createElement("div");
  puzzleHost.className = "puzzle-host";
  nodeEls[PUZZLE_AFTER_NODE_INDEX].insertAdjacentElement("afterend", puzzleHost);
  renderPuzzle(puzzleHost, memoryNodes[PUZZLE_AFTER_NODE_INDEX].photos[0], () => {
    puzzleHost.insertAdjacentHTML("afterend", "<p class=\"puzzle-solved-msg\">拼图完成！</p>");
  });

  const WHEEL_AFTER_NODE_INDEX = 5;
  const wheelHost = document.createElement("div");
  wheelHost.className = "wheel-host";
  nodeEls[WHEEL_AFTER_NODE_INDEX].insertAdjacentElement("afterend", wheelHost);
  renderWheel(wheelHost, wheelOptions, () => {});

  container.style.position = "relative";
  scatterEggs(container, easterEggTexts);

  observeReveal(".memory-node");

  const lastNode = nodeEls[nodeEls.length - 1];
  lastNode.addEventListener("transitionend", () => {
    const revealEl = document.getElementById("reveal");
    renderReveal(revealEl, letterParagraphs, giftText);
    armRevealAnimation(revealEl, () => {
      window.confetti && window.confetti({ particleCount: 150, spread: 70 });
    });
  }, { once: true });
}

document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("cover").hidden = true;
  renderTimeline();
}, { once: true });
