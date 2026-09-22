import { test } from "node:test";
import assert from "node:assert";
import { renderReveal, armRevealAnimation } from "../js/reveal.js";

test("renderReveal builds markup without triggering confetti", () => {
  const fakeContainer = { innerHTML: "", hidden: true };
  renderReveal(fakeContainer, ["p1", "p2"], "gift");
  assert.strictEqual(fakeContainer.hidden, false);
  assert.ok(fakeContainer.innerHTML.includes("p1"));
  assert.ok(fakeContainer.innerHTML.includes("gift"));
});

test("armRevealAnimation triggers confetti exactly once, only when the container intersects", () => {
  let calls = 0;
  const unobserveCalls = [];
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe() {}
    unobserve(el) { unobserveCalls.push(el); }
  };
  const fakeContainer = { classList: { add() {} } };
  armRevealAnimation(fakeContainer, () => { calls++; });
  assert.strictEqual(calls, 0);
});

test("armRevealAnimation fires confetti exactly once across repeated intersections", () => {
  let calls = 0;
  let capturedCb;
  global.IntersectionObserver = class {
    constructor(cb) { capturedCb = cb; }
    observe() {}
    unobserve() {}
  };
  const fakeContainer = { classList: { add() {} } };
  const observer = armRevealAnimation(fakeContainer, () => { calls++; });
  capturedCb([{ isIntersecting: true, target: fakeContainer }], observer);
  capturedCb([{ isIntersecting: true, target: fakeContainer }], observer);
  assert.strictEqual(calls, 1);
});
