export function armAudioOnFirstGesture(audioEl) {
  function onFirstClick() {
    audioEl.play().catch(() => {
      // Swallow rejection: file may be a placeholder with no real audio yet.
    });
    document.removeEventListener("click", onFirstClick);
  }
  document.addEventListener("click", onFirstClick, { once: true });
}
