import { test } from "node:test";
import assert from "node:assert";
import { shufflePieces, isSolved } from "../js/puzzle.js";

test("shufflePieces returns all n indices exactly once", () => {
  const order = shufflePieces(9, 42);
  assert.strictEqual(order.length, 9);
  assert.deepStrictEqual([...order].sort((a, b) => a - b), [0,1,2,3,4,5,6,7,8]);
});

test("isSolved is true only for the identity order", () => {
  assert.strictEqual(isSolved([0,1,2,3,4,5,6,7,8]), true);
  assert.strictEqual(isSolved([1,0,2,3,4,5,6,7,8]), false);
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
