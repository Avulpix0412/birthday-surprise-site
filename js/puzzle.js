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
