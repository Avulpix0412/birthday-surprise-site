export function observeReveal(selector) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  elements.forEach((el) => observer.observe(el));
  return observer;
}
