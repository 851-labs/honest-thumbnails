const DEFAULTS = { enabled: true, frame: 2 };
const enabledEl = document.getElementById("enabled");
const frameEl = document.getElementById("frame");

function render({ enabled, frame }) {
  enabledEl.checked = enabled;
  frameEl.classList.toggle("disabled", !enabled);
  for (const btn of frameEl.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", String(Number(btn.dataset.frame) === frame));
  }
}

chrome.storage.sync.get(DEFAULTS, (settings) => {
  render(settings);
  // Enable switch animation only after the initial state is painted.
  requestAnimationFrame(() => document.body.classList.add("ready"));
});

enabledEl.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: enabledEl.checked });
  chrome.storage.sync.get(DEFAULTS, render);
});

frameEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  chrome.storage.sync.set({ frame: Number(btn.dataset.frame) });
  chrome.storage.sync.get(DEFAULTS, render);
});
