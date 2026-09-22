import { test } from "node:test";
import assert from "node:assert";
import { decideSwipe } from "../js/swipeDecision.js";

test("a small drag with low velocity cancels back to center", () => {
  assert.strictEqual(decideSwipe({ deltaX: 10, velocity: 0.1, width: 400 }), "cancel");
});

test("dragging past 25% of card width commits to next/prev", () => {
  assert.strictEqual(decideSwipe({ deltaX: -120, velocity: 0.1, width: 400 }), "next");
  assert.strictEqual(decideSwipe({ deltaX: 120, velocity: 0.1, width: 400 }), "prev");
});

test("a fast flick commits even under the distance threshold", () => {
  assert.strictEqual(decideSwipe({ deltaX: -30, velocity: 0.6, width: 400 }), "next");
  assert.strictEqual(decideSwipe({ deltaX: 30, velocity: 0.6, width: 400 }), "prev");
});
