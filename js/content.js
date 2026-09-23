// Photos are stand-ins in the same "painted storybook illustration" style
// (public-domain Beatrix Potter plates) just to preview the full-bleed
// photo + overlaid-text layout — swap for real illustrations any time,
// same field shape.
//
// Wrap words in <span class="e1/e2/e3"> for the reference site's rising
// three-tier size rhythm across a whole line (small lead-in -> bigger ->
// biggest), instead of one flat sentence size. `textPos: "top"` moves the
// scrim+text to the top of the card for a photo whose open space is up
// there instead of at the bottom (default).
export const memoryNodes = [
  { id: "node-1", photos: ["assets/images/placeholder-storybook/PeterRabbit4.jpg", "assets/images/placeholder-storybook/PeterRabbit5.jpg"], story: "我们<span class=\"e1\">第一次</span><span class=\"e3\">见面</span>", detail: "占位小细节：那天天气很好。" },
  { id: "node-2", photos: ["assets/images/placeholder-storybook/PeterRabbit6.jpg"], story: "占位故事文字 2。", detail: "占位小细节 2。" },
  { id: "node-3", photos: ["assets/images/placeholder-storybook/PeterRabbit8.jpg"], story: "占位故事文字 3。", detail: "占位小细节 3。" },
  { id: "node-4", photos: ["assets/images/placeholder-storybook/PeterRabbit12.jpg"], story: "占位故事文字 4。", detail: "占位小细节 4。" },
  { id: "node-5", photos: ["assets/images/placeholder-storybook/PeterRabbit15.jpg"], story: "占位故事文字 5。", detail: "占位小细节 5。" },
  { id: "node-6", photos: ["assets/images/placeholder-storybook/PeterRabbit4.jpg"], story: "占位故事文字 6。", detail: "占位小细节 6。" },
  { id: "node-7", photos: ["assets/images/placeholder-storybook/PeterRabbit6.jpg"], story: "占位故事文字 7。", detail: "占位小细节 7。" },
  { id: "node-8", photos: ["assets/images/placeholder-storybook/PeterRabbit8.jpg"], story: "占位故事文字 8。", detail: "占位小细节 8。" },
];

export const easterEggTexts = [
  "占位彩蛋文字 1",
  "占位彩蛋文字 2",
  "占位彩蛋文字 3",
];

export const wheelOptions = [
  "我们的第一次牵手",
  "我们的第一次旅行",
  "我们的第一次吵架又和好",
  "我们的第一次一起做饭",
];

export const letterParagraphs = [
  "占位情书文字第一段。",
  "占位情书文字第二段。",
  "占位情书文字第三段。",
];

// Gift clues: small collectible objects that appear on specific memory
// cards along the way, echoing a real gift's look/colors without naming
// or showing the gift itself. Swap `icon` for a real image path any time.
// `pos` varies where it sits on the card (see .clue-item.pos-* in
// style.css) so hunting for it doesn't always mean checking the same
// corner.
export const giftClues = [
  { id: "clue-camera", icon: "assets/images/clue-camera.svg", pos: "top-right" },
  { id: "clue-mirror", icon: "assets/images/clue-strawberry.svg", pos: "bottom-left" },
  { id: "clue-necklace", icon: "assets/images/clue-bouquet.svg", pos: "mid-right" },
];

export const giftText = "占位礼物/旅行计划揭晓文字。";

export const songPath = "assets/audio/song.mp3";
