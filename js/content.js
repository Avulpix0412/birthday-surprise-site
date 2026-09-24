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
    story: "",
    detail: "",
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
  { id: "node-2", photos: ["assets/images/scenes/riverside.jpg"], story: "", detail: "", effect: "rain-fireworks" },
  { id: "node-3", photos: ["assets/images/scenes/mcdonalds.jpg"], story: "", detail: "", effect: "twinkle-chase" },
  { id: "node-4", photos: ["assets/images/scenes/forbidden-city.jpg"], story: "", detail: "", effect: "petals-pink" },
  {
    id: "node-5",
    photos: ["assets/images/scenes/beihai-park.jpg"],
    story: "",
    detail: "",
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
    story: "",
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
          { icon: "assets/images/clues/garden-item-4.png", pos: { x: "78%", y: "86%" }, size: "20%" },
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
  { id: "node-7", photos: ["assets/images/scenes/universal-studios.jpg"], story: "", detail: "", effect: "glow-pulse" },
  { id: "node-8", photos: ["assets/images/scenes/great-wall.jpg"], story: "", detail: "", effect: "petals-gold" },
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
