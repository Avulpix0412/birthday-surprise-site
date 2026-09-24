// Each node is one full-screen illustrated page, in the fixed order the
// user chose: 草莓 / 江边 / 中关村麦当劳 / 故宫 / 北海公园 / 普罗旺斯花园 /
// 环球影城 / 长城. No caption text for now (`story`/`detail` left empty —
// card-text-overlay simply doesn't render when there's nothing to show).
//
// Pages 1 (strawberry), 5 (beihai-park, camera clue) and 6
// (provence-garden, bracelet clue) are meant to become the three special
// interactive pages once the user provides separated interactive
// elements for them — paused for now, see giftClues below.
//
// `effect` gives the other five pages some ambient motion (see
// js/ambientEffects.js) without needing separated art — chosen per scene
// to sit naturally in what's already painted there, not a generic overlay:
// - rain-fireworks (riverside): matches the rain/fireworks already in the
//   scene.
// - twinkle-chase (mcdonalds): lights placed along the two tree-canopy
//   arcs actually drawn in that image, chasing in sequence — reads as
//   "those string lights are twinkling", not "random new dots".
// - petals-pink / petals-gold (forbidden-city / great-wall): both already
//   have painted clouds, so more translucent white blobs were invisible;
//   falling petals/leaves read clearly against the sky instead.
// - glow-pulse (universal-studios): a soft pulsing glow centered on the
//   tunnel's own purple lighting, plus a few sparkles.
export const memoryNodes = [
  { id: "node-1", photos: ["assets/images/scenes/strawberry-farm.jpg"], story: "", detail: "" },
  { id: "node-2", photos: ["assets/images/scenes/riverside.jpg"], story: "", detail: "", effect: "rain-fireworks" },
  { id: "node-3", photos: ["assets/images/scenes/mcdonalds.jpg"], story: "", detail: "", effect: "twinkle-chase" },
  { id: "node-4", photos: ["assets/images/scenes/forbidden-city.jpg"], story: "", detail: "", effect: "petals-pink" },
  { id: "node-5", photos: ["assets/images/scenes/beihai-park.jpg"], story: "", detail: "" },
  { id: "node-6", photos: ["assets/images/scenes/provence-garden.jpg"], story: "", detail: "" },
  { id: "node-7", photos: ["assets/images/scenes/universal-studios.jpg"], story: "", detail: "", effect: "glow-pulse" },
  { id: "node-8", photos: ["assets/images/scenes/great-wall.jpg"], story: "", detail: "", effect: "petals-gold" },
];

export const letterParagraphs = [
  "占位情书文字第一段。",
  "占位情书文字第二段。",
  "占位情书文字第三段。",
];

// Gift clues: paused. Once the user provides separated interactive
// elements for the strawberry / camera / bracelet pages, each entry here
// gets a `hotspot` + `target` (see main.js's attachHotspotClue) or `pos`
// and is wired back into cardSequence.js's card-attachment logic.
export const giftClues = [
  { id: "clue-camera", icon: "assets/images/clue-camera.svg" },
  { id: "clue-mirror", icon: "assets/images/clue-strawberry.svg" },
  { id: "clue-necklace", icon: "assets/images/clue-bouquet.svg" },
];

export const giftText = "占位礼物/旅行计划揭晓文字。";

export const songPath = "assets/audio/song.mp3";
