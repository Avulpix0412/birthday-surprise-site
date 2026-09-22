import { test } from "node:test";
import assert from "node:assert";
import { armAudioOnFirstGesture } from "../js/audio.js";

test("armAudioOnFirstGesture calls play() on first document click", () => {
  const listeners = {};
  global.document = {
    addEventListener: (evt, cb) => { listeners[evt] = cb; },
    removeEventListener: () => {},
  };
  let played = false;
  const fakeAudio = { play: () => { played = true; return Promise.resolve(); } };
  armAudioOnFirstGesture(fakeAudio);
  listeners.click();
  assert.strictEqual(played, true);
});
