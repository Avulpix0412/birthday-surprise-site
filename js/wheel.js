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
