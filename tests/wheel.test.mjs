import { test } from "node:test";
import assert from "node:assert";
import { pickOption } from "../js/wheel.js";

test("pickOption returns a valid index into options", () => {
  const options = ["a", "b", "c"];
  const idx = pickOption(options, 7);
  assert.ok(idx >= 0 && idx < options.length);
});

test("pickOption is deterministic for the same seed", () => {
  const options = ["a", "b", "c", "d"];
  assert.strictEqual(pickOption(options, 7), pickOption(options, 7));
});
