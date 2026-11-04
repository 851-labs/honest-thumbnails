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

let state = { ...DEFAULTS };

chrome.storage.sync.get(DEFAULTS, (settings) => {
  state = settings;
  render(state);
  // Enable switch animation only after the initial state is painted.
  requestAnimationFrame(() => document.body.classList.add("ready"));
});

// Update the popup right away and save in the background. Waiting on a storage
// round trip before redrawing made Safari lag a click behind.
function update(change) {
  state = { ...state, ...change };
  render(state);
  chrome.storage.sync.set(change);
}

enabledEl.addEventListener("change", () => update({ enabled: enabledEl.checked }));

frameEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) update({ frame: Number(btn.dataset.frame) });
});
