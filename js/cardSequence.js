export const ACCENT_CYCLE = ["rose", "moss", "mustard", "violet", "teal"];

export function buildCardSequence({ memoryNodes, letterParagraphs, letterPhoto, giftBlessingText, giftQuestionText }) {
  const cards = [];

  memoryNodes.forEach((node, groupIndex) => {
    const accent = ACCENT_CYCLE[groupIndex % ACCENT_CYCLE.length];
    node.photos.forEach((photo, photoIndex) => {
      const text = photoIndex === 0 ? node.story : (node.detail || "");
      const card = { kind: "memory", groupIndex, photo, text, accent, effect: node.effect };
      if (photoIndex === 0 && node.clue) card.clue = node.clue;
      if (node.textPos) card.textPos = node.textPos;
      if (node.textTheme) card.textTheme = node.textTheme;
      cards.push(card);
    });
  });

  cards.push({ kind: "letter", paragraphs: letterParagraphs, photo: letterPhoto, accent: "coral" });
  cards.push({ kind: "gift", blessingText: giftBlessingText, questionText: giftQuestionText, accent: "coral" });

  return cards;
}
