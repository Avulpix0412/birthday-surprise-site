export const MIN_HIT_AREA_PX = 44;

export function scatterEggs(container, texts) {
  texts.forEach((text) => {
    const icon = document.createElement("button");
    icon.className = "easter-egg";
    icon.textContent = "💛";
    icon.style.minWidth = `${MIN_HIT_AREA_PX}px`;
    icon.style.minHeight = `${MIN_HIT_AREA_PX}px`;
    icon.style.position = "absolute";
    icon.style.left = `${Math.random() * 80}%`;
    icon.style.top = `${Math.random() * 80}%`;
    icon.addEventListener("click", () => {
      icon.replaceWith(document.createTextNode(text));
    }, { once: true });
    container.appendChild(icon);
  });
}
