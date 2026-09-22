import { test } from "node:test";
import assert from "node:assert";
import { MIN_HIT_AREA_PX, scatterEggs } from "../js/easterEggs.js";

test("MIN_HIT_AREA_PX meets iOS tap target guidance", () => {
  assert.ok(MIN_HIT_AREA_PX >= 44);
});

test("scatterEggs creates one element per text with the min hit area", () => {
  global.document = {
    createElement: () => ({ style: {}, addEventListener: () => {} }),
  };
  const created = [];
  const fakeContainer = { appendChild(el) { created.push(el); } };
  scatterEggs(fakeContainer, ["a", "b", "c"]);
  assert.strictEqual(created.length, 3);
  created.forEach((el) => {
    assert.strictEqual(el.style.minWidth, `${MIN_HIT_AREA_PX}px`);
    assert.strictEqual(el.style.minHeight, `${MIN_HIT_AREA_PX}px`);
  });
});

test("clicking an egg reveals its text in place, at the same position, instead of falling into document flow", () => {
  let clickHandler;
  const icon = {
    style: {},
    className: "",
    textContent: "",
    addEventListener: (evt, cb) => { clickHandler = cb; },
    replaceWith: (node) => { icon._replacedWith = node; },
  };
  global.document = {
    createElement: () => icon,
  };
  const fakeContainer = { appendChild() {} };
  scatterEggs(fakeContainer, ["surprise text"]);
  icon.style.left = "12%";
  icon.style.top = "34%";
  clickHandler();
  assert.strictEqual(icon._replacedWith.textContent, "surprise text");
  assert.strictEqual(icon._replacedWith.style.position, "absolute");
  assert.strictEqual(icon._replacedWith.style.left, "12%");
  assert.strictEqual(icon._replacedWith.style.top, "34%");
});
