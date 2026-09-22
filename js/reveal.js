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
