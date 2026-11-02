// Captures live YouTube pages with the extension turned off and on, for the
// store screenshots. Run via `store/build.sh capture` (it supplies Playwright).
//
// Writes to store/screenshots/assets/:
//   channel-off.png / channel-on.png   the channel's Videos tab, extension off / on
//   popup-off.png   / popup-on.png     the extension popup in each state
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "store/screenshots/assets");
const CHANNEL = "https://www.youtube.com/@MrBeast/videos";

// Chrome derives an unpacked extension's ID from its absolute path.
const extensionId = [...crypto.createHash("sha256").update(ROOT).digest("hex").slice(0, 32)]
  .map((c) => String.fromCharCode(97 + parseInt(c, 16)))
  .join("");

async function setEnabled(popup, enabled) {
  const checked = await popup.isChecked("#enabled");
  if (checked !== enabled) await popup.click(".slider");
  await popup.waitForTimeout(400);
}

(async () => {
  const ctx = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    locale: "en-US",
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
    args: [`--disable-extensions-except=${ROOT}`, `--load-extension=${ROOT}`],
  });

  const popup = await ctx.newPage();
  await popup.setViewportSize({ width: 272, height: 190 });
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);

  const page = await ctx.newPage();
  const capture = async (state) => {
    await setEnabled(popup, state === "on");
    await page.goto(CHANNEL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("ytd-rich-grid-media, yt-lockup-view-model", { timeout: 20000 });
    // Scroll so the Latest/Popular/Oldest chips sit just below the sticky tab bar,
    // which leaves two full rows of videos in view.
    await page.evaluate(() => {
      const chips = document.querySelector("ytd-feed-filter-chip-bar-renderer, chip-bar-view-model, #chips");
      const y = chips ? chips.getBoundingClientRect().top + window.scrollY - 100 : 620;
      window.scrollTo(0, y);
    });
    await page.waitForTimeout(6000); // let thumbnails (and frame swaps) load
    await page.mouse.move(1270, 850); // park the cursor so no hover previews play
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `channel-${state}.png`) });
    await popup.screenshot({ path: path.join(OUT, `popup-${state}.png`) });
    const swapped = await page.evaluate(
      () => document.querySelectorAll("img[data-honest]").length
    );
    console.log(`captured ${state}: ${swapped} thumbnails swapped`);
  };

  await capture("off");
  await capture("on");
  await ctx.close();
})();
