import { test } from "node:test";
import assert from "node:assert";
import { paletteColor } from "../js/flourish.js";

test("paletteColor returns an exact palette entry at an integer position", () => {
  const palette = [[10, 20, 30], [40, 50, 60]];
  assert.strictEqual(paletteColor(palette, 0), "rgb(10,20,30)");
  assert.strictEqual(paletteColor(palette, 1), "rgb(40,50,60)");
});

test("paletteColor blends between entries at a fractional position", () => {
  const palette = [[0, 0, 0], [100, 100, 100]];
  assert.strictEqual(paletteColor(palette, 0.5), "rgb(50,50,50)");
});

test("paletteColor wraps around past the end of the palette", () => {
  const palette = [[0, 0, 0], [100, 100, 100]];
  assert.strictEqual(paletteColor(palette, 2), "rgb(0,0,0)");
});
