export const ACCENT_CYCLE = ["rose", "moss", "mustard", "violet", "teal"];

const PUZZLE_AFTER_GROUP = 2;
const WHEEL_AFTER_GROUP = 5;
const EGG_GROUPS = [0, 3, 6];

export function buildCardSequence({ memoryNodes, easterEggTexts, wheelOptions, letterParagraphs, giftText }) {
  const cards = [];
  let eggCursor = 0;

  memoryNodes.forEach((node, groupIndex) => {
    const accent = ACCENT_CYCLE[groupIndex % ACCENT_CYCLE.length];
    node.photos.forEach((photo, photoIndex) => {
      const text = photoIndex === 0 ? node.story : (node.detail || "");
      const card = { kind: "memory", groupIndex, photo, text, accent };
      if (photoIndex === 0 && EGG_GROUPS.includes(groupIndex)) {
        card.eggText = easterEggTexts[eggCursor];
        eggCursor++;
      }
      cards.push(card);
    });

    if (groupIndex === PUZZLE_AFTER_GROUP) {
      cards.push({ kind: "puzzle", photo: node.photos[0], accent: "mustard" });
    }
    if (groupIndex === WHEEL_AFTER_GROUP) {
      cards.push({ kind: "wheel", options: wheelOptions, accent: "violet" });
    }
  });

  cards.push({ kind: "letter", paragraphs: letterParagraphs, accent: "coral" });
  cards.push({ kind: "gift", text: giftText, accent: "coral" });

  return cards;
}
