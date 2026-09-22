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
