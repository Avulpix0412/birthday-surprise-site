import { memoryNodes, wheelOptions, easterEggTexts, letterParagraphs, giftText } from "./content.js";
import { observeReveal } from "./scrollAnimate.js";
import { renderPuzzle } from "./puzzle.js";
import { renderWheel } from "./wheel.js";
import { scatterEggs } from "./easterEggs.js";
import { renderReveal } from "./reveal.js";

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

  const puzzleHost = document.createElement("div");
  puzzleHost.className = "puzzle-host";
  document.getElementById("node-3").insertAdjacentElement("afterend", puzzleHost);
  renderPuzzle(puzzleHost, memoryNodes[3].photos[0], () => {
    puzzleHost.insertAdjacentHTML("beforeend", "<p>拼图完成！</p>");
  });

  const wheelHost = document.createElement("div");
  wheelHost.className = "wheel-host";
  document.getElementById("node-6").insertAdjacentElement("afterend", wheelHost);
  renderWheel(wheelHost, wheelOptions, () => {});

  container.style.position = "relative";
  scatterEggs(container, easterEggTexts);

  observeReveal(".memory-node");

  const lastNode = document.getElementById(memoryNodes[memoryNodes.length - 1].id);
  lastNode.addEventListener("transitionend", () => {
    renderReveal(document.getElementById("reveal"), letterParagraphs, giftText, () => {
      window.confetti && window.confetti({ particleCount: 150, spread: 70 });
    });
  }, { once: true });
}

document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("cover").hidden = true;
  renderTimeline();
}, { once: true });
