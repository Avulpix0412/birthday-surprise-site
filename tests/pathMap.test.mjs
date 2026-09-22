import { test } from "node:test";
import assert from "node:assert";
import { computePathPositions } from "../js/pathMap.js";

test("computePathPositions returns one point per card, spanning the given width", () => {
  const points = computePathPositions(5, 400, 40);
  assert.strictEqual(points.length, 5);
  assert.strictEqual(points[0].x, 0);
  assert.strictEqual(points[points.length - 1].x, 400);
  points.forEach((p) => {
    assert.ok(p.y >= 0 && p.y <= 40);
  });
});

test("computePathPositions handles a single card without dividing by zero", () => {
  const points = computePathPositions(1, 400, 40);
  assert.strictEqual(points.length, 1);
  assert.ok(Number.isFinite(points[0].x));
  assert.ok(Number.isFinite(points[0].y));
});
