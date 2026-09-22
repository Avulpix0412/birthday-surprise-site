let confettiFired = false;

export function renderReveal(container, letterParagraphs, giftText) {
  container.hidden = false;
  const giftDelay = letterParagraphs.length * 0.6;
  container.innerHTML = letterParagraphs.map((p, i) =>
    `<p class="letter-p" style="animation-delay:${i * 0.6}s">${p}</p>`
  ).join("") + `<p class="letter-p gift-text" style="animation-delay:${giftDelay}s">${giftText}</p>`;
}

export function armRevealAnimation(container, triggerConfetti) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        obs.unobserve(entry.target);
        if (!confettiFired) {
          confettiFired = true;
          triggerConfetti();
        }
      }
    });
  }, { threshold: 0.3 });
  observer.observe(container);
  return observer;
}
