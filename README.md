# Honest Thumbnails

Honest Thumbnails is a Chrome and Firefox extension that replaces YouTube's uploader-chosen thumbnails with a real frame from the middle of each video.

<a href="https://chromewebstore.google.com/detail/honest-thumbnails/kocjpadfddegoogneldhlkiibopgdphk"><img src=".github/chrome-web-store-badge.png" alt="Available in the Chrome Web Store" width="206"></a>

![Before and after: a clickbait thumbnail next to a real frame from the same video](store/screenshot-1-before-after.png)

## What it looks like

![MrBeast's channel with the extension off: the uploaded thumbnails](store/screenshot-2-extension-off.png)

![The same channel with the extension on: a real frame from each video](store/screenshot-3-extension-on.png)

## How it works

Besides the thumbnail the uploader picks, YouTube automatically saves three stills from every video, roughly a quarter, half and three-quarters of the way through. They live at predictable addresses:

| Image | Size | Availability |
| --- | --- | --- |
| `i.ytimg.com/vi/<id>/maxres1.jpg`, `maxres2.jpg`, `maxres3.jpg` | 1280×720 | HD videos |
| `i.ytimg.com/vi/<id>/hq1.jpg`, `hq2.jpg`, `hq3.jpg` | 480×360 | every video |

Honest Thumbnails finds each thumbnail on the page and swaps it for the chosen frame: Early, Middle, Late, or Auto. Auto uses the middle frame unless it's mostly empty, like a black screen or a title card, and then switches to the early or late frame if one has clearly more in it. It decides by checking YouTube's tiny 120×90 versions of the frames for detail. It tries the HD version first, falls back to the smaller one, and keeps the original if neither exists. Everything happens in your browser. The idea comes from [HackerTube](https://hackertube.org/), which uses the same mid-video frame.

**It covers:**
- the home feed, search results, channel pages and the watch-page sidebar
- the video player's preview image and the grid of videos shown when a video ends
- embedded players on `youtube.com` and `youtube-nocookie.com`

**Limitations:**
- **Auto only catches empty frames.** It skips black screens and sparse title cards, but not a sponsor segment or a frame filled with big text.
- **"Roughly the middle" is approximate.** YouTube doesn't document exactly when these frames are taken.
- **Static videos look the same.** For podcasts with a cover image or music uploads with album art, the frame is the same image as before.

## Privacy

No account, no analytics, no tracking. The extension never sends data anywhere. It only loads images from YouTube's own image server, and it only stores your on/off setting and frame choice. It runs only on YouTube. See [PRIVACY.md](PRIVACY.md).

## License

[MIT](LICENSE) © 851 Labs
