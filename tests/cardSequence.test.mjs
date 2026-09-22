import { test } from "node:test";
import assert from "node:assert";
import { buildCardSequence, ACCENT_CYCLE } from "../js/cardSequence.js";

const content = {
  memoryNodes: [
    { photos: ["p1a.svg", "p1b.svg"], story: "story1", detail: "detail1" },
    { photos: ["p2.svg"], story: "story2", detail: "detail2" },
    { photos: ["p3.svg"], story: "story3", detail: "detail3" },
    { photos: ["p4.svg"], story: "story4", detail: "detail4" },
    { photos: ["p5.svg"], story: "story5", detail: "detail5" },
    { photos: ["p6.svg"], story: "story6", detail: "detail6" },
    { photos: ["p7.svg"], story: "story7", detail: "detail7" },
    { photos: ["p8.svg"], story: "story8", detail: "detail8" },
  ],
  easterEggTexts: ["egg1", "egg2", "egg3"],
  wheelOptions: ["a", "b", "c", "d"],
  letterParagraphs: ["l1", "l2"],
  giftText: "gift",
};

test("buildCardSequence expands multi-photo nodes into one card per photo", () => {
  const cards = buildCardSequence(content);
  const memoryCardsForNode0 = cards.filter((c) => c.kind === "memory" && c.groupIndex === 0);
  assert.strictEqual(memoryCardsForNode0.length, 2);
  assert.strictEqual(memoryCardsForNode0[0].photo, "p1a.svg");
  assert.strictEqual(memoryCardsForNode0[0].text, "story1");
  assert.strictEqual(memoryCardsForNode0[1].photo, "p1b.svg");
  assert.strictEqual(memoryCardsForNode0[1].text, "detail1");
});

test("buildCardSequence inserts the puzzle card right after group index 2, and the wheel card right after group index 5", () => {
  const cards = buildCardSequence(content);
  const puzzleIdx = cards.findIndex((c) => c.kind === "puzzle");
  const wheelIdx = cards.findIndex((c) => c.kind === "wheel");
  assert.ok(puzzleIdx > -1);
  assert.ok(wheelIdx > -1);
  assert.strictEqual(cards[puzzleIdx - 1].groupIndex, 2);
  assert.strictEqual(cards[puzzleIdx + 1].groupIndex, 3);
  assert.strictEqual(cards[wheelIdx - 1].groupIndex, 5);
  assert.strictEqual(cards[wheelIdx + 1].groupIndex, 6);
  assert.strictEqual(cards[puzzleIdx].photo, "p3.svg");
  assert.deepStrictEqual(cards[wheelIdx].options, ["a", "b", "c", "d"]);
});

test("buildCardSequence ends with a letter card then a gift card", () => {
  const cards = buildCardSequence(content);
  const last2 = cards.slice(-2);
  assert.strictEqual(last2[0].kind, "letter");
  assert.deepStrictEqual(last2[0].paragraphs, ["l1", "l2"]);
  assert.strictEqual(last2[1].kind, "gift");
  assert.strictEqual(last2[1].text, "gift");
});

test("buildCardSequence cycles accents across memory card groups using ACCENT_CYCLE", () => {
  const cards = buildCardSequence(content);
  for (let g = 0; g < content.memoryNodes.length; g++) {
    const card = cards.find((c) => c.kind === "memory" && c.groupIndex === g);
    assert.strictEqual(card.accent, ACCENT_CYCLE[g % ACCENT_CYCLE.length]);
  }
});

test("buildCardSequence attaches easter egg texts to the first card of groups 0, 3, and 6 only", () => {
  const cards = buildCardSequence(content);
  const withEggs = cards.filter((c) => c.kind === "memory" && c.eggText);
  assert.strictEqual(withEggs.length, 3);
  assert.strictEqual(cards.find((c) => c.groupIndex === 0 && c.kind === "memory").eggText, "egg1");
  assert.strictEqual(cards.find((c) => c.groupIndex === 3 && c.kind === "memory").eggText, "egg2");
  assert.strictEqual(cards.find((c) => c.groupIndex === 6 && c.kind === "memory").eggText, "egg3");
});
