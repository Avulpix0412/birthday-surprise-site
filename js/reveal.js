export function buildLetterHTML(paragraphs) {
  return paragraphs.map((p, i) =>
    `<p class="letter-p" style="animation-delay:${i * 0.6}s">${p}</p>`
  ).join("");
}

export function buildGiftHTML(text) {
  return `<p class="gift-text">${text}</p>`;
}

let confettiFired = false;

export function triggerConfettiOnce(triggerFn) {
  if (confettiFired) return;
  confettiFired = true;
  triggerFn();
}
