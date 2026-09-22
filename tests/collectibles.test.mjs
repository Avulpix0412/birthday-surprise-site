import { test } from "node:test";
import assert from "node:assert";
import { buildTrayState, pickNudgeMessage, NUDGE_MESSAGES } from "../js/collectibles.js";

const clues = [
  { id: "clue-a", icon: "a.svg" },
  { id: "clue-b", icon: "b.svg" },
];

test("buildTrayState marks only collected ids as collected", () => {
  const state = buildTrayState(clues, ["clue-b"]);
  assert.deepStrictEqual(state, [
    { id: "clue-a", icon: "a.svg", collected: false },
    { id: "clue-b", icon: "b.svg", collected: true },
  ]);
});

test("buildTrayState with no collected ids marks everything uncollected", () => {
  const state = buildTrayState(clues, []);
  assert.ok(state.every((s) => s.collected === false));
});

test("pickNudgeMessage cycles through NUDGE_MESSAGES", () => {
  assert.strictEqual(pickNudgeMessage(0), NUDGE_MESSAGES[0]);
  assert.strictEqual(pickNudgeMessage(1), NUDGE_MESSAGES[1 % NUDGE_MESSAGES.length]);
  assert.strictEqual(pickNudgeMessage(NUDGE_MESSAGES.length), NUDGE_MESSAGES[0]);
});
