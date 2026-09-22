export const MIN_HIT_AREA_PX = 44;

export function attachEgg(host, text) {
  const btn = document.createElement("button");
  btn.className = "egg-btn";
  btn.textContent = "💛";
  btn.style.minWidth = `${MIN_HIT_AREA_PX}px`;
  btn.style.minHeight = `${MIN_HIT_AREA_PX}px`;
  btn.addEventListener("click", () => {
    const popup = document.createElement("span");
    popup.className = "egg-text";
    popup.textContent = text;
    btn.replaceWith(popup);
  }, { once: true });
  host.appendChild(btn);
}
