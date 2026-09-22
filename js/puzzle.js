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

export function createPuzzleState(initialOrder) {
  const order = [...initialOrder];
  let solved = isSolved(order);
  let selected = null;

  return {
    get order() { return order; },
    get solved() { return solved; },
    get selected() { return selected; },
    click(slotIndex, onSolved) {
      if (solved) return;
      if (selected === null) {
        selected = slotIndex;
        return;
      }
      [order[selected], order[slotIndex]] = [order[slotIndex], order[selected]];
      selected = null;
      if (isSolved(order)) {
        solved = true;
        if (onSolved) onSolved();
      }
    },
  };
}

export function renderPuzzle(container, imagePath, onSolved, seed) {
  const GRID = 3;
  let initialOrder = shufflePieces(GRID * GRID, seed);
  while (isSolved(initialOrder)) initialOrder = shufflePieces(GRID * GRID); // never start solved
  const state = createPuzzleState(initialOrder);

  function draw() {
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${GRID}, 1fr)`;
    state.order.forEach((pieceIndex, slotIndex) => {
      const piece = document.createElement("button");
      const col = pieceIndex % GRID;
      const row = Math.floor(pieceIndex / GRID);
      piece.style.minHeight = "44px";
      piece.style.minWidth = "44px";
      piece.style.backgroundImage = `url(${imagePath})`;
      piece.style.backgroundSize = `${GRID * 100}% ${GRID * 100}%`;
      piece.style.backgroundPosition = `${(col * 100) / (GRID - 1)}% ${(row * 100) / (GRID - 1)}%`;
      piece.dataset.slot = String(slotIndex);
      if (state.selected === slotIndex) piece.classList.add("selected");
      piece.addEventListener("click", () => onPieceClick(slotIndex));
      container.appendChild(piece);
    });
  }

  function onPieceClick(slotIndex) {
    if (state.solved) return;
    state.click(slotIndex, onSolved);
    draw();
  }

  draw();
}
