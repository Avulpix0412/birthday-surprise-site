import { test } from "node:test";
import assert from "node:assert";
import { buildLetterHTML, buildGiftHTML, triggerConfettiOnce } from "../js/reveal.js";

test("buildLetterHTML renders one paragraph per line with staggered delays", () => {
  const html = buildLetterHTML(["p1", "p2"]);
  assert.ok(html.includes("p1"));
  assert.ok(html.includes("p2"));
  assert.ok(html.includes("animation-delay:0s"));
  assert.ok(html.includes("animation-delay:0.6s"));
});

test("buildGiftHTML renders the gift text", () => {
  assert.ok(buildGiftHTML("my gift").includes("my gift"));
});

test("triggerConfettiOnce calls the given function exactly once across repeated calls", () => {
  let calls = 0;
  triggerConfettiOnce(() => { calls++; });
  triggerConfettiOnce(() => { calls++; });
  triggerConfettiOnce(() => { calls++; });
  assert.strictEqual(calls, 1);
});
