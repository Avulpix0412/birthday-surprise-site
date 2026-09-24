export const ACCENT_CYCLE = ["rose", "moss", "mustard", "violet", "teal"];

export function buildCardSequence({ memoryNodes, letterParagraphs, giftText }) {
  const cards = [];

  memoryNodes.forEach((node, groupIndex) => {
    const accent = ACCENT_CYCLE[groupIndex % ACCENT_CYCLE.length];
    node.photos.forEach((photo, photoIndex) => {
      const text = photoIndex === 0 ? node.story : (node.detail || "");
      const card = { kind: "memory", groupIndex, photo, text, accent, effect: node.effect };
      if (photoIndex === 0 && node.clue) card.clue = node.clue;
      cards.push(card);
    });
  });

  cards.push({ kind: "letter", paragraphs: letterParagraphs, accent: "coral" });
  cards.push({ kind: "gift", text: giftText, accent: "coral" });

  return cards;
}
