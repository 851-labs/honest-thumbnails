# Honest Thumbnails

**See what's actually in the video, not the clickbait.**

Honest Thumbnails is a Chrome extension that replaces YouTube's uploader-chosen thumbnails with a real frame from the middle of each video.

![Before and after: a clickbait thumbnail next to a real frame from the same video](store/screenshot-1-before-after.png)

## Install

- **Chrome Web Store:** in review. The link will be added here once it's live.
- **From source:**
  1. Clone this repo.
  2. Open `chrome://extensions` and turn on **Developer mode**.
  3. Click **Load unpacked** and select the repo folder.

Click the toolbar icon to turn the extension on or off, or to pick an **Early**, **Middle** or **Late** frame.

## What it looks like

![MrBeast's channel with the extension off: the uploaded thumbnails](store/screenshot-2-extension-off.png)

![The same channel with the extension on: a real frame from each video](store/screenshot-3-extension-on.png)

## How it works

Besides the thumbnail the uploader picks, YouTube automatically saves three stills from every video, roughly a quarter, half and three-quarters of the way through. They live at predictable addresses:

| Image | Size | Availability |
| --- | --- | --- |
| `i.ytimg.com/vi/<id>/maxres1.jpg`, `maxres2.jpg`, `maxres3.jpg` | 1280×720 | HD videos |
| `i.ytimg.com/vi/<id>/hq1.jpg`, `hq2.jpg`, `hq3.jpg` | 480×360 | every video |

Honest Thumbnails finds each thumbnail on the page and swaps it for the chosen frame. It tries the HD version first, falls back to the smaller one, and keeps the original if neither exists. Everything happens in your browser. The idea comes from [HackerTube](https://hackertube.org/), which uses the same mid-video frame.

**It covers:**
- the home feed, search results, channel pages and the watch-page sidebar
- the video player's preview image and the grid of videos shown when a video ends
- embedded players on `youtube.com` and `youtube-nocookie.com`

**Limitations:**
- **It's a fixed point, not a smart pick.** If the middle of a video is a title card, a black screen or a sponsor segment, that's what you'll see. Try the Early or Late frame instead.
- **"Roughly the middle" is approximate.** YouTube doesn't document exactly when these frames are taken.
- **Static videos look the same.** For podcasts with a cover image or music uploads with album art, the frame is the same image as before.

## Privacy

No account, no analytics, no tracking. The extension never sends data anywhere. It only loads images from YouTube's own image server, and it only stores your on/off setting and frame choice. It runs only on YouTube. See [PRIVACY.md](PRIVACY.md).

## License

[MIT](LICENSE) © 851 Labs
