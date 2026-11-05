# Development

The extension lives in `extension/` and has no build step. To work on it:

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select the `extension/` folder.
3. Edit the files, then click reload on the extension's card to pick up changes.

In Firefox (140 or later), open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on** and pick `extension/manifest.json`. `npx web-ext lint --source-dir extension` checks the extension against Mozilla's rules.

## Project layout

```
extension/            The extension itself (what ships to the Chrome Web Store)
  manifest.json       Manifest V3: storage permission, content script on YouTube, Firefox ID
  content.js          Finds thumbnails and swaps in YouTube's auto-generated frames
  content.css         Crops the letterbox bars on 4:3 frames
  popup.html/.js      On/off switch and Early/Middle/Late choice
  icons/              Toolbar and store icons (16, 32, 48, 128 px)
store/                Chrome Web Store listing assets and build scripts
.github/              README assets
PRIVACY.md            Privacy policy (linked from the store listing, so keep this path)
```

## Store assets

Everything for the Chrome Web Store listing is in `store/` and can be rebuilt from the repo. The tooling needs Node; run `npm install` once.

- `store/screenshots/*.html`: the screenshots, each a 1280×800 HTML page. Shared styles are in `shared.css` and images in `assets/`. Edit these to change text or layout.
- `store/promo/*.html`: the promo tile. The file name carries the size, e.g. `small-440x280.html`.
- `store/capture.cjs`: loads the extension in headless Chromium and captures `youtube.com/@MrBeast/videos` with the extension off and on, plus the popup in each state. Screenshots 2 and 3 use these captures.
- `store/build.sh`: renders the pages to PNGs with Playwright and packages the extension zip.

```sh
npm run build     # screenshots + promo tile + zip
npm run capture   # re-capture the live YouTube pages (then run `npm run shots`)
npm run shots     # screenshots and promo tile only
npm run zip       # extension zip only
```

## Releasing an update

1. Bump `version` in `extension/manifest.json`.
2. Run `npm run zip`.
3. In the Chrome Web Store dashboard, upload `store/honest-thumbnails-<version>.zip` under **Package** and click **Submit for review**.
