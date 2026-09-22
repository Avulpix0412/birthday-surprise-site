import { test } from "node:test";
import assert from "node:assert";
import { shufflePieces, isSolved, createPuzzleState } from "../js/puzzle.js";

test("shufflePieces returns all n indices exactly once", () => {
  const order = shufflePieces(9, 42);
  assert.strictEqual(order.length, 9);
  assert.deepStrictEqual([...order].sort((a, b) => a - b), [0,1,2,3,4,5,6,7,8]);
});

test("isSolved is true only for the identity order", () => {
  assert.strictEqual(isSolved([0,1,2,3,4,5,6,7,8]), true);
  assert.strictEqual(isSolved([1,0,2,3,4,5,6,7,8]), false);
});

test("createPuzzleState swaps two selected slots", () => {
  const state = createPuzzleState([1, 0, 2, 3, 4, 5, 6, 7, 8]);
  state.click(0);
  state.click(1);
  assert.deepStrictEqual(state.order, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.strictEqual(state.solved, true);
});

test("createPuzzleState ignores clicks once solved, and onSolved fires only once", () => {
  const state = createPuzzleState([1, 0, 2, 3, 4, 5, 6, 7, 8]);
  let solvedCount = 0;
  state.click(0);
  state.click(1, () => { solvedCount++; });
  assert.strictEqual(solvedCount, 1);
  // Further clicks after solved must not change order or re-fire onSolved.
  state.click(0);
  state.click(2, () => { solvedCount++; });
  assert.deepStrictEqual(state.order, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.strictEqual(solvedCount, 1);
});

test("renderPuzzle pieces meet the 44px minimum touch target", async () => {
  global.document = {
    createElement: () => ({ style: {}, dataset: {}, addEventListener: () => {} }),
  };
  const fakeContainer = { style: {}, innerHTML: "", appendChild(el) { this._last = el; } };
  const { renderPuzzle } = await import("../js/puzzle.js");
  renderPuzzle(fakeContainer, "fake.svg", () => {});
  assert.strictEqual(fakeContainer._last.style.minHeight, "44px");
  assert.strictEqual(fakeContainer._last.style.minWidth, "44px");
});
