const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

initCursor();
initPolaroidTilt();
initActiveNavLink();

/** Custom cursor: a black circle that tracks the pointer 1:1 and grows over links. */
function initCursor(): void {
  if (isCoarsePointer) return;

  const dotEl = document.getElementById("cursor-dot");
  if (!dotEl) return;
  const dot = dotEl;

  document.body.classList.add("custom-cursor-enabled");

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let queued = false;

  window.addEventListener(
    "mousemove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      dot.classList.add("is-visible");
      if (!queued) {
        queued = true;
        requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => dot.classList.remove("is-visible"));

  const interactiveSelector = "a, button, input, textarea, [role='button']";
  document.addEventListener("mouseover", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(interactiveSelector)) {
      dot.classList.add("is-active");
    }
  });
  document.addEventListener("mouseout", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(interactiveSelector)) {
      dot.classList.remove("is-active");
    }
  });

  function apply(): void {
    queued = false;
    dot.style.setProperty("--cx", `${x}px`);
    dot.style.setProperty("--cy", `${y}px`);
  }
}

/** Reads each polaroid's data-tilt attribute into the --tilt custom property. */
function initPolaroidTilt(): void {
  document.querySelectorAll<HTMLElement>(".polaroid[data-tilt]").forEach((el) => {
    const tilt = el.dataset.tilt;
    if (tilt) el.style.setProperty("--tilt", tilt);
  });
}

/** Highlights the terminal nav link matching the section in view. */
function initActiveNavLink(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(".terminal-nav__link");
  const sections = Array.from(links)
    .map((link) => document.querySelector(link.getAttribute("href") ?? ""))
    .filter((el): el is Element => el !== null);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}
