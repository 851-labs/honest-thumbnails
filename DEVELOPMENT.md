# Development

There's no build step for the extension itself. Load the repo folder with **Load unpacked** in `chrome://extensions` (Developer mode on), edit the files, and click reload on the extension's card to pick up changes.

## Project layout

```
manifest.json     Manifest V3: storage permission, content script on YouTube
content.js        Finds thumbnails and swaps in YouTube's auto-generated frames
content.css       Crops the letterbox bars on 4:3 frames
popup.html/.js    On/off switch and Early/Middle/Late choice
icons/            Toolbar and store icons (16, 32, 48, 128 px)
store/            Chrome Web Store listing assets (see below)
```

## Store assets

Everything for the Chrome Web Store listing is in `store/` and can be rebuilt from the repo:

- `store/screenshots/*.html`: the screenshots, each a 1280×800 HTML page. Shared styles are in `shared.css` and images in `assets/`. Edit these to change text or layout.
- `store/promo/*.html`: the promo tile. The file name carries the size, e.g. `small-440x280.html`.
- `store/capture.cjs`: loads the extension in headless Chromium and captures `youtube.com/@MrBeast/videos` with the extension off and on, plus the popup in each state. Screenshots 2 and 3 use these captures.
- `store/build.sh`: renders the pages to PNGs with Playwright and packages the extension zip. It needs Node, and the first run downloads Chromium. Nothing is installed into the repo, since the repo folder is also the unpacked extension.

```sh
store/build.sh          # screenshots + promo tile + zip
store/build.sh capture  # re-capture the live YouTube pages (then run `shots`)
store/build.sh shots    # screenshots and promo tile only
store/build.sh zip      # extension zip only
```

## Releasing an update

1. Bump `version` in `manifest.json`.
2. Run `store/build.sh zip`.
3. In the Chrome Web Store dashboard, upload the zip under **Package** and click **Submit for review**.
