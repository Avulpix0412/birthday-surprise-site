export const ACCENT_CYCLE = ["rose", "moss", "mustard", "violet", "teal"];

const PUZZLE_AFTER_GROUP = 2;
const WHEEL_AFTER_GROUP = 5;
const EGG_GROUPS = [0, 3, 6];
const CLUE_GROUPS = [1, 4, 7];

export function chapterForGroup(groupIndex, totalGroups) {
  const third = totalGroups / 3;
  if (groupIndex < third) return 0;
  if (groupIndex < third * 2) return 1;
  return 2;
}

export function buildCardSequence({ memoryNodes, easterEggTexts, wheelOptions, letterParagraphs, giftText, giftClues = [] }) {
  const cards = [];
  const totalGroups = memoryNodes.length;
  let eggCursor = 0;
  let clueCursor = 0;

  memoryNodes.forEach((node, groupIndex) => {
    const accent = ACCENT_CYCLE[groupIndex % ACCENT_CYCLE.length];
    const chapter = chapterForGroup(groupIndex, totalGroups);
    node.photos.forEach((photo, photoIndex) => {
      const text = photoIndex === 0 ? node.story : (node.detail || "");
      const card = { kind: "memory", groupIndex, photo, text, accent, chapter };
      if (photoIndex === 0 && EGG_GROUPS.includes(groupIndex)) {
        card.eggText = easterEggTexts[eggCursor];
        eggCursor++;
      }
      if (photoIndex === 0 && CLUE_GROUPS.includes(groupIndex) && clueCursor < giftClues.length) {
        card.clue = giftClues[clueCursor];
        clueCursor++;
      }
      cards.push(card);
    });

    if (groupIndex === PUZZLE_AFTER_GROUP) {
      cards.push({ kind: "puzzle", photo: node.photos[0], accent: "mustard", chapter });
    }
    if (groupIndex === WHEEL_AFTER_GROUP) {
      cards.push({ kind: "wheel", options: wheelOptions, accent: "violet", chapter });
    }
  });

  const finaleChapter = chapterForGroup(totalGroups - 1, totalGroups);
  cards.push({ kind: "letter", paragraphs: letterParagraphs, accent: "coral", chapter: finaleChapter });
  cards.push({ kind: "gift", text: giftText, accent: "coral", chapter: finaleChapter });

  return cards;
}
