# Privacy Policy: Honest Thumbnails

_Last updated: November 1, 2026_

Honest Thumbnails is a Chrome extension published by 851 Labs. It replaces video thumbnails on YouTube with a frame that YouTube auto-generates from the video itself.

## What the extension does with data

- **No personal data is collected.** The extension doesn't collect, store, sell, or share any personal information, browsing history, or usage data.
- **No analytics or tracking.** There are no analytics, ads, cookies, or third-party scripts.
- **No servers.** The extension doesn't send data to 851 Labs or anyone else. All of its code runs locally in your browser.

## What the extension stores

It saves two settings with Chrome's `storage` API:

- whether the extension is turned on
- which frame to show (early, middle, or late)

If you're signed in to Chrome with sync turned on, Chrome syncs these two settings across your devices. You can clear them at any time by removing the extension.

## Network requests

On YouTube pages, the extension loads thumbnail images from YouTube's own image server (`i.ytimg.com`), the same server YouTube already uses for thumbnails. It sends nothing else anywhere.

## Permissions

- **`storage`**: saves the two settings above.
- **Access to `youtube.com` and `youtube-nocookie.com`**: needed to replace thumbnail images on those pages. The extension doesn't run on any other site.

## Changes

If this policy changes, the updated version will be published at this address.

## Contact

Questions? Open an issue at https://github.com/851-labs/honest-thumbnails/issues.
