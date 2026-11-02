# Honest Thumbnails

A Chrome extension that replaces YouTube's uploader-chosen (A/B-tested, clickbait) thumbnails
with a real frame from the video. Inspired by [HackerTube](https://hackertube.org/).

YouTube generates three frames for every video at roughly 25% / 50% / 75% of the way through.
The extension uses `i.ytimg.com/vi/<id>/maxresN.jpg` (1280×720) and falls back to `hqN.jpg`
(480×360, always available) when there is no HD version.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick this folder.

Click the toolbar icon to turn it on or off, or to choose the Early / Middle / Late frame.

## What it covers

- Thumbnails on the home feed, search, watch-page sidebar, channel pages and playlists (`<img>` tags)
- The player poster and end-screen video wall (CSS `background-image`)
- Embedded players on youtube.com and youtube-nocookie.com

## License

MIT, see [LICENSE](LICENSE). Privacy policy: [PRIVACY.md](PRIVACY.md).

## Chrome Web Store assets

Everything for the store listing lives in `store/`:

- `store/screenshots/*.html`: the screenshots, each a 1280×800 HTML page (shared styles in `shared.css`, images in `assets/`). Edit these to change the text or layout.
- `store/promo/*.html`: the promo tile(s); the file name carries the size, e.g. `small-440x280.html`.
- `store/capture.cjs`: loads the extension in headless Chromium and captures youtube.com/@MrBeast/videos with the extension off and on (plus the popup in each state) into `store/screenshots/assets/`. Screenshots 2 and 3 are built from these.
- `store/build.sh`: renders each page to `store/screenshot-<name>.png` with Playwright and packages the extension zip. It needs Node; the first run downloads Chromium.

```sh
store/build.sh          # screenshots + zip
store/build.sh capture  # re-capture the live YouTube pages (then run `shots`)
store/build.sh shots    # screenshots only
store/build.sh zip      # zip only
```
