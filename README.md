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

MIT, see [LICENSE](LICENSE).
