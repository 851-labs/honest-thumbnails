// Honest Thumbnails — swap YouTube's uploader-chosen thumbnails for an
// auto-generated frame from the video itself.
//
// YouTube auto-generates three frames per video at roughly 25% / 50% / 75%:
//   i.ytimg.com/vi/<id>/{1,2,3}.jpg         120x90, always present (letterboxed)
//   i.ytimg.com/vi/<id>/hq{1,2,3}.jpg       480x360, always present (letterboxed)
//   i.ytimg.com/vi/<id>/maxres{1,2,3}.jpg   1280x720, present for HD videos
// We prefer maxresN and fall back to hqN. In Auto mode the 120x90 frames are
// used to choose N.
(() => {
  "use strict";

  const DEFAULTS = { enabled: true, frame: 2 };
  const ORIGIN = "https://i.ytimg.com";

  // Video thumbnails live under /vi/<id>/ or /vi_webp/<id>/. Storyboards (/sb/)
  // and animated hover previews (/an_webp/) are deliberately not matched.
  const THUMB_RE = /^(?:https?:)?\/\/i\d*\.ytimg\.com\/vi(?:_webp)?\/([\w-]{11})\/(\w+)\.(?:jpg|webp)/;
  // Names that are already auto-generated frames, not uploader thumbnails.
  const AUTO_FRAME_RE = /^(?:hq|mq|sd|maxres|oar|hq720_)?[123]$/;
  const CSS_URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/;
  // YouTube serves a 120x90 grey placeholder for frames that don't exist.
  const PLACEHOLDER_WIDTH = 120;

  let settings = { ...DEFAULTS };

  // ---- Frame resolution ---------------------------------------------------

  const cache = new Map(); // "<id>:<frame>" -> Promise<url | null>

  function probe(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > PLACEHOLDER_WIDTH);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // ---- Auto frame pick ----------------------------------------------------
  //
  // Frame 0 means "Auto": use the middle frame unless it's mostly empty (a black
  // screen, a title card), and then the early or late frame if it's clearly
  // better. The 120x90 frames at /vi/<id>/{1,2,3}.jpg are ~2 KB and served with
  // CORS headers, so we can read their pixels. We split the picture into a grid
  // and count the cells with real detail.

  const GRID_COLS = 8;
  const GRID_ROWS = 4;
  const CELL = 15; // 8x4 cells of 15x16 px cover the 120x64 band inside the letterbox
  const CELL_H = 16;
  const TOP = 13; // the 4:3 frames have ~11 px letterbox bars above and below
  const BUSY_STDDEV = 12; // luma standard deviation that counts as "detail"
  const EMPTY = 0.4; // below this fraction of detailed cells, a frame is "empty"
  const MARGIN = 0.2; // how much better another frame must be to replace it

  let canvas;

  function loadPixels(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas ??= new OffscreenCanvas(120, 90).getContext("2d", { willReadFrequently: true });
        canvas.drawImage(img, 0, 0, 120, 90);
        resolve(canvas.getImageData(0, 0, 120, 90).data);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Fraction of grid cells whose luma varies enough to hold detail (0..1).
  function busyness(px) {
    let busy = 0;
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        let sum = 0;
        let sq = 0;
        for (let y = TOP + row * CELL_H; y < TOP + (row + 1) * CELL_H; y++) {
          for (let x = col * CELL; x < (col + 1) * CELL; x++) {
            const i = (y * 120 + x) * 4;
            const luma = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
            sum += luma;
            sq += luma * luma;
          }
        }
        const n = CELL * CELL_H;
        const mean = sum / n;
        if (Math.sqrt(sq / n - mean * mean) > BUSY_STDDEV) busy++;
      }
    }
    return busy / (GRID_COLS * GRID_ROWS);
  }

  async function pickFrame(id) {
    const score = async (frame) => {
      const px = await loadPixels(`${ORIGIN}/vi/${id}/${frame}.jpg`);
      return px ? busyness(px) : -1;
    };
    const middle = await score(2);
    if (middle >= EMPTY) return 2;
    const [early, late] = await Promise.all([score(1), score(3)]);
    const best = early >= late ? 1 : 3;
    return Math.max(early, late) >= middle + MARGIN ? best : 2;
  }

  function resolveFrame(id, frame) {
    const key = `${id}:${frame}`;
    let promise = cache.get(key);
    if (!promise) {
      promise = (async () => {
        if (frame === 0) frame = await pickFrame(id);
        for (const name of [`maxres${frame}`, `hq${frame}`]) {
          const url = `${ORIGIN}/vi/${id}/${name}.jpg`;
          if (await probe(url)) return url;
        }
        return null;
      })();
      cache.set(key, promise);
    }
    return promise;
  }

  function parseThumb(url) {
    const m = url && THUMB_RE.exec(url);
    if (!m || AUTO_FRAME_RE.test(m[2])) return null;
    return m[1];
  }

  // ---- <img> thumbnails ---------------------------------------------------

  function processImg(img) {
    const src = img.getAttribute("src") || "";
    if (img.dataset.honest && src === img.dataset.honest) return; // ours

    // New src from YouTube (first load, or element recycled for another video):
    // forget any state from a previous swap.
    delete img.dataset.honest;
    delete img.dataset.honestSrcset;

    const id = parseThumb(src);
    if (!id) {
      delete img.dataset.honestOrig;
      return;
    }

    img.dataset.honestOrig = src;
    const frame = settings.frame;
    resolveFrame(id, frame).then((url) => {
      if (!url || !settings.enabled || settings.frame !== frame) return;
      if (img.getAttribute("src") !== src) return; // recycled while probing
      img.dataset.honest = url; // mark before setting src so the observer skips it
      if (img.hasAttribute("srcset")) {
        img.dataset.honestSrcset = img.getAttribute("srcset");
        img.removeAttribute("srcset");
      }
      img.src = url;
    });
  }

  function restoreSrcset(img) {
    if (img.dataset.honestSrcset !== undefined) {
      img.setAttribute("srcset", img.dataset.honestSrcset);
      delete img.dataset.honestSrcset;
    }
  }

  // ---- background-image thumbnails (player poster, end-screen wall) -------

  function processBg(el) {
    const style = el.getAttribute("style");
    if (!style || !style.includes("ytimg.com")) return;
    const bg = el.style.backgroundImage;
    const m = bg && CSS_URL_RE.exec(bg);
    if (!m) return;
    const current = m[1];
    if (el.dataset.honestBg && current === el.dataset.honestBg) return; // ours

    delete el.dataset.honestBg;
    const id = parseThumb(current);
    if (!id) {
      delete el.dataset.honestBgOrig;
      return;
    }

    el.dataset.honestBgOrig = bg;
    const frame = settings.frame;
    resolveFrame(id, frame).then((url) => {
      if (!url || !settings.enabled || settings.frame !== frame) return;
      if (el.style.backgroundImage !== bg) return;
      el.dataset.honestBg = url;
      el.style.backgroundImage = `url("${url}")`;
    });
  }

  // ---- Scanning & observing -----------------------------------------------

  function scan(root) {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.tagName === "IMG") processImg(root);
    else if (root.getAttribute?.("style")) processBg(root);
    for (const img of root.querySelectorAll('img[src*="ytimg.com/vi"]')) processImg(img);
    for (const el of root.querySelectorAll('[style*="ytimg.com/vi"]')) processBg(el);
  }

  const observer = new MutationObserver((mutations) => {
    if (!settings.enabled) return;
    for (const m of mutations) {
      if (m.type === "attributes") {
        if (m.attributeName === "src") {
          if (m.target.tagName === "IMG") processImg(m.target);
        } else {
          processBg(m.target);
        }
      } else {
        for (const node of m.addedNodes) scan(node);
      }
    }
  });

  function revertAll() {
    for (const img of document.querySelectorAll("img[data-honest-orig]")) {
      const ours = img.dataset.honest;
      const orig = img.dataset.honestOrig;
      delete img.dataset.honest;
      delete img.dataset.honestOrig;
      restoreSrcset(img);
      if (ours && img.getAttribute("src") === ours) img.src = orig;
    }
    for (const el of document.querySelectorAll("[data-honest-bg-orig]")) {
      const ours = el.dataset.honestBg;
      const orig = el.dataset.honestBgOrig;
      delete el.dataset.honestBg;
      delete el.dataset.honestBgOrig;
      if (ours && el.style.backgroundImage.includes(ours)) el.style.backgroundImage = orig;
    }
  }

  function start() {
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src", "style"],
    });
    if (settings.enabled) scan(document);
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in DEFAULTS) settings[key] = newValue ?? DEFAULTS[key];
    }
    revertAll();
    if (settings.enabled) scan(document);
  });

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
    start();
  });
})();
