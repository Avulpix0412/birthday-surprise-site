// Each node is one full-screen illustrated page, in the fixed order the
// user chose: 草莓 / 江边 / 中关村麦当劳 / 故宫 / 北海公园 / 普罗旺斯花园 /
// 环球影城 / 长城. No caption text for now (`story`/`detail` left empty —
// card-text-overlay simply doesn't render when there's nothing to show).
//
// Page 6 (provence-garden): `clue.bouquet` scatters 6 separately-provided
// flower/fruit sprigs over the scene (tap each — no drag, six drags would
// be tedious). Each tap pops with a scale+fade, a small progress pill
// counts them down, and once all six are picked, a full assembled
// bouquet image fades in as the page's payoff.
//
// Page 1 (strawberry): `clue.drag` places a separately-provided
// strawberry and basket on top of the scene — drag the strawberry into
// the basket (positioned over the girl's hand) to collect it. One
// successful drag is enough, no need to "fill" the basket.
//
// Page 5 (beihai-park): `clue.photoShoot` places a draggable camera in
// the corner — a pulsing dashed ring at `targetPos` (aimed at her
// neck/chest, not her face) marks where to drag it. Drop inside the ring
// and a shutter flash plays, the background photo swaps to `blinkPhoto`
// for a beat (a same-composition photo the user provided with her eyes
// closed) then back to normal. Rather than snapping onto her body, the
// camera settles at `restPos` — low, centered, and enlarged (`restSize`)
// — reading as an off-screen photographer holding it up close to
// themselves, at a distance from her, instead of glued to her face.
//
// All positions are {x, y} percentages of the card's own size, picked by
// eye from the photo; sizes are percentages of the card's width (the
// item images are square with transparent padding, so the drawn object
// reads smaller than the box).
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
  {
    id: "node-1",
    photos: ["assets/images/scenes/strawberry-farm.jpg"],
    // Sized to a short emphasis phrase each (Chinese characters run much
    // wider than Latin letters at the same font-size, so e2/e3 — built
    // for short punchlines — would overflow a narrow phone if wrapped
    // around a whole clause instead of just its 5-6 character peak).
    story:
      "我们的第一次活动，是你听到我也想摘草莓，<span class=\"e2\">然后带我实现。</span><br>" +
      "当时的我很紧张，但又很幸福，白色的草莓<span class=\"e3\">纯洁又甜蜜</span>，就像我们两个一样。",
    detail: "",
    // Both interactive elements (the strawberry and the basket) sit in
    // the lower half of the photo — text goes up top, over the open
    // greenhouse sky, so it never covers them.
    textPos: "top",
    clue: {
      id: "clue-mirror",
      drag: {
        itemIcon: "assets/images/clues/strawberry-item.png",
        itemPos: { x: "11%", y: "72%" },
        itemSize: "13%",
        hintText: "把我放到篮子里吧",
        basketIcon: "assets/images/clues/basket.png",
        basketPos: { x: "88%", y: "53%" },
        basketSize: "24%",
      },
    },
  },
  {
    id: "node-2",
    photos: ["assets/images/scenes/riverside.jpg"],
    story:
      "在一起之后的第一个夜晚，天空中下着<span class=\"e2\">好大的雨。</span><br>" +
      "当时只觉得自己很幸福，看着远处时有时无的烟花，<br>" +
      "眼下只有我们两个打着一把伞相互依偎。<br>" +
      "脑海中想的是要和你<span class=\"e3\">一起走下去</span>……",
    detail: "",
    // Night scene — dark ink would vanish into the dark sky, so this page
    // uses the light-fill/dark-stroke variant instead.
    textPos: "top",
    textTheme: "dark",
    effect: "rain-fireworks",
  },
  {
    id: "node-3",
    photos: ["assets/images/scenes/mcdonalds.jpg"],
    // One block-level emphasis span, not two — the first draft's two
    // spans pushed the text down far enough to cover the people in the
    // photo; kept compact like page 4 instead.
    story:
      "转眼到了夏天。你第一次来北京找我。<br>" +
      "那一天真的好开心，我带你去了很多我从小就去的地方，<br>" +
      "和你一起走过熟悉的场景，我回想起了年初你带我在襄阳漫步时的感觉。<br>" +
      "那晚的灯光很梦幻，你就像<span class=\"e2\">童话里走出的人物</span>一样……",
    detail: "",
    textPos: "top",
    textTheme: "dark",
    effect: "twinkle-chase",
  },
  {
    id: "node-4",
    photos: ["assets/images/scenes/forbidden-city.jpg"],
    // Kept compact (only one block-level emphasis span) — the open sky
    // above her is a much narrower band here than on the other pages.
    story:
      "亭亭玉立，<span class=\"e1\">花容月貌</span>。<br>" +
      "在人群中一眼就能把你认出来，走了很多步却不觉得累。<br>" +
      "边听你描述甄嬛传的情节边看着你，<br>" +
      "眼前的你仿佛<span class=\"e2\">超脱于这个时代</span>……",
    detail: "",
    textPos: "top",
    effect: "petals-pink",
  },
  {
    id: "node-5",
    photos: ["assets/images/scenes/beihai-park.jpg"],
    // Formatting only, not wording, was trimmed here — the first draft's
    // extra <br> line-breaks plus a block-level e2 span pushed the text
    // down far enough to cover the frame's own "北海公园" title and reach
    // her hair. All inline emphasis instead, one fewer forced line break.
    story:
      "到公园之后好像有一点不愉快，原因记不清，<span class=\"e1\">因为很快就和好了</span>。<br>" +
      "看着远处的白塔和荡漾的湖面，牵着手和你一起<span class=\"e1\">漫无目的地散步</span>。<br>" +
      "没有城市的喧嚣和烦恼，只有郁郁葱葱和放松愉悦。<br>" +
      "微风拂过，思绪又不知飘去了哪里……",
    detail: "",
    // The willow tree/sky above her clears both the aim-ring (60%) and
    // the camera's rest spot (88%) by a wide margin.
    textPos: "top",
    clue: {
      id: "clue-camera",
      photoShoot: {
        cameraIcon: "assets/images/clues/camera-item.png",
        cameraPos: { x: "82%", y: "90%" },
        cameraSize: "16%",
        hintText: "给我拍张照吧",
        // Aimed at her neck/collar, not her face.
        targetPos: { x: "57%", y: "60%" },
        targetRadius: "14%",
        // Where the camera settles after a successful shot: low and
        // centered, enlarged — an off-screen photographer's own hands,
        // not an object glued to her body.
        restPos: { x: "50%", y: "88%" },
        restSize: "30%",
        normalPhoto: "assets/images/scenes/beihai-park.jpg",
        blinkPhoto: "assets/images/scenes/beihai-park-blink.jpg",
      },
    },
  },
  {
    id: "node-6",
    photos: ["assets/images/scenes/provence-garden.jpg"],
    // Short and placed at the bottom — the top/sides are already dense
    // with the six pickable sprigs (see clue.bouquet.items below), so
    // this is the one page using the default bottom position instead of
    // "top". Checked against item 4 (the only item sharing this band)
    // via real rendered bounding boxes, not just eyeballed.
    story:
      "你点名要去的植物园。在五彩缤纷花朵衬托下的窈窕淑女，<br>" +
      "你的<span class=\"e1\">一颦一笑</span>都令我心动……<br>" +
      "这个场景让我想起一句应景的诗：<br>" +
      "<span class=\"e1\">取次花丛懒回顾，半缘修道半缘君。</span>",
    detail: "",
    clue: {
      id: "clue-bouquet",
      bouquet: {
        // Positions picked from open ground/sky around her figure (she
        // occupies roughly the center column), near where the painted
        // scene already has matching flowers/fruit, so each pick reads
        // as "gathering what's already growing here".
        items: [
          { icon: "assets/images/clues/garden-item-1.png", pos: { x: "16%", y: "10%" }, size: "22%" },
          { icon: "assets/images/clues/garden-item-2.png", pos: { x: "84%", y: "38%" }, size: "18%" },
          { icon: "assets/images/clues/garden-item-3.png", pos: { x: "13%", y: "58%" }, size: "20%" },
          // Was x:78%,y:86%, then x:82%,y:68% — both still fell inside
          // the bottom text band once the story text grew (a wide line
          // rendered right through it either way, since long left-aligned
          // lines reach past x:70%). The right column (items 2 and 6) had
          // no free gap left either, so this moved to the left side
          // instead, in the open gap between items 1 and 3, clear of both
          // her figure and the text band.
          { icon: "assets/images/clues/garden-item-4.png", pos: { x: "13%", y: "40%" }, size: "20%" },
          // Was x:45%,y:12% — sat almost directly under the fixed
          // collection tray (which is centered, top:56px), so it was
          // mostly hidden behind it. Moved clear of the tray's zone.
          { icon: "assets/images/clues/garden-item-5.png", pos: { x: "30%", y: "20%" }, size: "18%" },
          { icon: "assets/images/clues/garden-item-6.png", pos: { x: "84%", y: "53%" }, size: "18%" },
        ],
        resultImage: "assets/images/clues/bouquet-full.png",
      },
    },
  },
  {
    id: "node-7",
    photos: ["assets/images/scenes/universal-studios.jpg"],
    // All inline emphasis and fewer forced line breaks (formatting only,
    // same words) — the first draft's block-level e2 span pushed the
    // text down far enough to reach the two kids' faces.
    story:
      "最近一次见面，看着你从第一个项目的<span class=\"e1\">不敢睁眼</span>到最后一个项目的<span class=\"e1\">意犹未尽</span>。<br>" +
      "<span class=\"e1\">过山车在空中飞驰</span>，把一切烦恼都扫掉，你收获了成长，<br>" +
      "但在我的身边，你是否会多一点安全感呢？",
    detail: "",
    // Open sky is upper-left; the coaster structure and the glow-pulse
    // effect (centered lower-right at 58%/33%) both sit clear of it.
    textPos: "top",
    effect: "glow-pulse",
  },
  {
    id: "node-8",
    photos: ["assets/images/scenes/great-wall.jpg"],
    story:
      "和你一起挑战了自我，<span class=\"e1\">早起开车，坐缆车，爬长城</span>。<br>" +
      "看着人类的奇迹和大自然的鬼斧神工，<br>" +
      "最安心的莫过于<span class=\"e2\">有彼此在身边陪伴</span>了吧……",
    detail: "",
    textPos: "top",
    effect: "petals-gold",
  },
];

export const letterParagraphs = [
  "占位情书文字第一段。",
  "占位情书文字第二段。",
  "占位情书文字第三段。",
];

export const giftClues = [
  { id: "clue-camera", icon: "assets/images/clues/camera-item.png" },
  { id: "clue-mirror", icon: "assets/images/clues/strawberry-item.png" },
  { id: "clue-bouquet", icon: "assets/images/clues/bouquet-icon.png" },
];

export const giftText = "占位礼物/旅行计划揭晓文字。";

export const songPath = "assets/audio/song.mp3";
