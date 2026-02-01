import anime from "animejs/lib/anime.es";


function splitLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function render(title: string, text: string, step: number) {
  const titleEl = document.getElementById("title");
  const linesEl = document.getElementById("lines");
  const kickerEl = document.getElementById("kicker");
  if (!titleEl || !linesEl || !kickerEl) return;

  kickerEl.textContent = `CHAPITRE ${step}/3`;
  titleEl.textContent = title;

  linesEl.innerHTML = "";

  const lines = splitLines(text);
  for (const line of lines) {
    const p = document.createElement("p");
    p.className = "line";
    p.textContent = line;
    linesEl.appendChild(p);
  }

  const nodes = Array.from(linesEl.querySelectorAll(".line"));
  anime.remove(nodes);
  anime({
    targets: nodes,
    opacity: [0, 1],
    translateY: [10, 0],
    delay: anime.stagger(140),
    duration: 520,
    easing: "easeOutQuad",
  });
}

function initScrolly(rootId = "scrolly") {
  const root = document.getElementById(rootId);
  if (!root) return;

  const triggers = Array.from(root.querySelectorAll(".trigger")) as HTMLElement[];
  let activeStep = 1;

  // init : step 1 depuis le trigger 1
  const first = triggers.find((t) => Number(t.dataset.step) === 1);
  if (first) {
    render(first.dataset.title || "", first.dataset.text || "", 1);
  }

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (!visible) return;

      const t = visible.target as HTMLElement;
      const step = Number(t.dataset.step);
      if (!step || step === activeStep) return;

      activeStep = step;
      render(t.dataset.title || "", t.dataset.text || "", step);
    },
    { threshold: [0.25, 0.5, 0.75], rootMargin: "-10% 0px -10% 0px" }
  );

  triggers.forEach((t) => io.observe(t));
}

document.addEventListener("DOMContentLoaded", () => initScrolly("scrolly"));
