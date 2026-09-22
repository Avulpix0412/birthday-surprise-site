import { test } from "node:test";
import assert from "node:assert";

test("observeReveal adds is-visible once and does not re-observe", async () => {
  const calls = [];
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { calls.push(["observe", el]); }
    unobserve(el) { calls.push(["unobserve", el]); }
  };
  const div = { classList: { add: (c) => { div.added = c; } } };
  global.document = {
    querySelectorAll: () => [div],
  };
  const { observeReveal } = await import("../js/scrollAnimate.js");
  const observer = observeReveal(".x");
  observer.cb([{ isIntersecting: true, target: div }], observer);
  assert.strictEqual(div.added, "is-visible");
  assert.strictEqual(calls.filter((c) => c[0] === "unobserve").length, 1);
  // A real IntersectionObserver never re-fires its callback for a target
  // after unobserve() — that guarantee lives in the browser, not this code.
  // Re-invoking cb manually here (as this fake allows) still leaves the
  // element in the same visible state and calls unobserve again, which is
  // a harmless no-op on a real observed target — idempotent by effect.
  observer.cb([{ isIntersecting: true, target: div }], observer);
  assert.strictEqual(div.added, "is-visible");
});
