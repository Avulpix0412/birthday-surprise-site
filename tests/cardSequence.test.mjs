import { test } from "node:test";
import assert from "node:assert";
import { buildCardSequence, ACCENT_CYCLE } from "../js/cardSequence.js";

const content = {
  memoryNodes: [
    { photos: ["p1.svg"], story: "story1", detail: "detail1" },
    { photos: ["p2.svg"], story: "story2", detail: "detail2" },
    { photos: ["p3.svg"], story: "story3", detail: "detail3" },
  ],
  letterParagraphs: ["l1", "l2"],
  giftText: "gift",
};

test("buildCardSequence produces one memory card per node, in order", () => {
  const cards = buildCardSequence(content);
  const memoryCards = cards.filter((c) => c.kind === "memory");
  assert.strictEqual(memoryCards.length, 3);
  assert.deepStrictEqual(memoryCards.map((c) => c.photo), ["p1.svg", "p2.svg", "p3.svg"]);
  assert.deepStrictEqual(memoryCards.map((c) => c.text), ["story1", "story2", "story3"]);
});

test("buildCardSequence expands multi-photo nodes into one card per photo", () => {
  const cards = buildCardSequence({
    ...content,
    memoryNodes: [{ photos: ["a.svg", "b.svg"], story: "s", detail: "d" }],
  });
  const memoryCards = cards.filter((c) => c.kind === "memory");
  assert.strictEqual(memoryCards.length, 2);
  assert.strictEqual(memoryCards[0].photo, "a.svg");
  assert.strictEqual(memoryCards[0].text, "s");
  assert.strictEqual(memoryCards[1].photo, "b.svg");
  assert.strictEqual(memoryCards[1].text, "d");
});

test("buildCardSequence ends with a letter card then a gift card", () => {
  const cards = buildCardSequence(content);
  const last2 = cards.slice(-2);
  assert.strictEqual(last2[0].kind, "letter");
  assert.deepStrictEqual(last2[0].paragraphs, ["l1", "l2"]);
  assert.strictEqual(last2[1].kind, "gift");
  assert.strictEqual(last2[1].text, "gift");
});

test("buildCardSequence cycles accents across memory nodes using ACCENT_CYCLE", () => {
  const cards = buildCardSequence(content);
  const memoryCards = cards.filter((c) => c.kind === "memory");
  memoryCards.forEach((c, i) => {
    assert.strictEqual(c.accent, ACCENT_CYCLE[i % ACCENT_CYCLE.length]);
  });
});

test("buildCardSequence carries a node's ambient effect onto its card(s), when present", () => {
  const cards = buildCardSequence({
    ...content,
    memoryNodes: [
      { photos: ["a.svg"], story: "s", detail: "d", effect: "rain-fireworks" },
      { photos: ["b.svg"], story: "s2", detail: "d2" },
    ],
  });
  const memoryCards = cards.filter((c) => c.kind === "memory");
  assert.strictEqual(memoryCards[0].effect, "rain-fireworks");
  assert.strictEqual(memoryCards[1].effect, undefined);
});

test("buildCardSequence carries a node's clue onto only the first of its cards", () => {
  const clue = { id: "clue-mirror", drag: { itemIcon: "x.png" } };
  const cards = buildCardSequence({
    ...content,
    memoryNodes: [{ photos: ["a.svg", "b.svg"], story: "s", detail: "d", clue }],
  });
  const memoryCards = cards.filter((c) => c.kind === "memory");
  assert.strictEqual(memoryCards[0].clue, clue);
  assert.strictEqual(memoryCards[1].clue, undefined);
});
