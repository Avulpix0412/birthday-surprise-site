import { test } from "node:test";
import assert from "node:assert";
import { rainDropY, twinkleAlpha, cloudOffsetX, sparkleProgress } from "../js/ambientEffects.js";

test("rainDropY wraps around the canvas height as time advances", () => {
  const speed = 0.5; // px per ms, matching real usage
  const height = 500;
  const y0 = rainDropY(0, 0, speed, height);
  const yHalf = rainDropY(400, 0, speed, height);
  assert.strictEqual(y0, 0);
  assert.ok(yHalf > y0);
  // Past a full cycle (height / speed = 1000ms), it wraps back toward the start.
  const yWrapped = rainDropY(1000, 0, speed, height);
  assert.ok(yWrapped < yHalf);
});

test("twinkleAlpha stays within [0, 1] and varies over time", () => {
  const samples = [0, 100, 300, 700, 1500].map((t) => twinkleAlpha(t, 0, 1));
  samples.forEach((a) => assert.ok(a >= 0 && a <= 1, `alpha ${a} out of range`));
  assert.ok(new Set(samples).size > 1, "alpha should vary across time samples");
});

test("cloudOffsetX wraps around the given width", () => {
  const x = cloudOffsetX(10000, 0.01, 400);
  assert.ok(x >= 0 && x < 400);
});

test("cloudOffsetX handles negative or zero time without producing NaN", () => {
  assert.ok(Number.isFinite(cloudOffsetX(0, 0.01, 400)));
});

test("sparkleProgress rises from 0 toward 1 across its duration then resets", () => {
  const early = sparkleProgress(0, 1000);
  const mid = sparkleProgress(500, 1000);
  const justAfter = sparkleProgress(1001, 1000);
  assert.strictEqual(early, 0);
  assert.ok(mid > early && mid < 1);
  assert.ok(justAfter >= 0 && justAfter < 0.1, "should have wrapped back near 0");
});
