import { test } from "node:test";
import assert from "node:assert";
import { MIN_HIT_AREA_PX, attachEgg } from "../js/easterEggs.js";

test("MIN_HIT_AREA_PX meets iOS tap target guidance", () => {
  assert.ok(MIN_HIT_AREA_PX >= 44);
});

test("attachEgg appends one button meeting the min hit area", () => {
  global.document = {
    createElement: () => ({ style: {}, className: "", addEventListener: () => {} }),
  };
  const appended = [];
  const host = { appendChild(el) { appended.push(el); } };
  attachEgg(host, "surprise");
  assert.strictEqual(appended.length, 1);
  assert.strictEqual(appended[0].style.minWidth, `${MIN_HIT_AREA_PX}px`);
  assert.strictEqual(appended[0].style.minHeight, `${MIN_HIT_AREA_PX}px`);
});

test("clicking the egg button reveals the text in place instead of falling into document flow", () => {
  let clickHandler;
  const btn = {
    style: {},
    className: "",
    textContent: "",
    addEventListener: (evt, cb) => { clickHandler = cb; },
    replaceWith: (node) => { btn._replacedWith = node; },
  };
  global.document = { createElement: () => btn };
  const host = { appendChild() {} };
  attachEgg(host, "surprise text");
  clickHandler();
  assert.strictEqual(btn._replacedWith.textContent, "surprise text");
  assert.strictEqual(btn._replacedWith.className, "egg-text");
});
