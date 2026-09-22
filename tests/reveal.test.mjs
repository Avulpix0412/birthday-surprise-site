import { test } from "node:test";
import assert from "node:assert";
import { renderReveal } from "../js/reveal.js";

test("renderReveal triggers confetti exactly once across repeated calls", () => {
  global.document = {
    createElement: () => ({ style: {}, classList: { add() {} }, appendChild() {} }),
  };
  const fakeContainer = { innerHTML: "", appendChild() {}, hidden: true };
  let calls = 0;
  renderReveal(fakeContainer, ["p1", "p2"], "gift", () => { calls++; });
  renderReveal(fakeContainer, ["p1", "p2"], "gift", () => { calls++; });
  assert.strictEqual(calls, 1);
});
