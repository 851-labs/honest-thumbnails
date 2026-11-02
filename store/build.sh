#!/usr/bin/env bash
# Builds Chrome Web Store assets.
#
#   store/build.sh            render screenshots + package the extension zip
#   store/build.sh capture    re-capture live YouTube pages used by the screenshots
#   store/build.sh shots      render screenshots only
#   store/build.sh zip        package the extension zip only
#
# Screenshots: every store/screenshots/<name>.html is rendered at 1280x800 to
# store/screenshot-<name>.png, and every store/promo/<name>-<W>x<H>.html at
# WxH to store/promo-<name>-<W>x<H>.png, using Playwright's CLI via npx (needs Node; the
# first run downloads Chromium). Nothing is installed into the repo, which
# matters because this folder is also loaded as the unpacked extension.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
PLAYWRIGHT="playwright@1.64.1"
what="${1:-all}"

shots() {
  npx -y "$PLAYWRIGHT" install chromium >/dev/null 2>&1  # quiet: warns about no package.json, which is intended
  for page in store/screenshots/*.html; do
    name="$(basename "$page" .html)"
    out="store/screenshot-$name.png"
    npx -y "$PLAYWRIGHT" screenshot --viewport-size=1280,800 \
      "file://$ROOT/$page" "$out" >/dev/null
    echo "rendered $out"
  done
  for page in store/promo/*.html; do
    name="$(basename "$page" .html)"            # e.g. small-440x280
    size="${name##*-}"; w="${size%x*}"; h="${size#*x}"
    out="store/promo-$name.png"
    npx -y "$PLAYWRIGHT" screenshot --viewport-size="$w,$h" \
      "file://$ROOT/$page" "$out" >/dev/null
    echo "rendered $out"
  done
}

capture() {
  # The capture script needs Playwright as a library. Install it into a cache
  # outside the repo (never node_modules here: this folder is the extension).
  cache="${XDG_CACHE_HOME:-$HOME/.cache}/honest-thumbnails-build"
  if [ ! -d "$cache/node_modules/playwright" ]; then
    mkdir -p "$cache"
    npm install --prefix "$cache" --silent --no-save "$PLAYWRIGHT" >/dev/null
  fi
  npx -y "$PLAYWRIGHT" install chromium >/dev/null 2>&1
  NODE_PATH="$cache/node_modules" node store/capture.cjs
}

zip_ext() {
  version="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)"
  out="store/honest-thumbnails-$version.zip"
  rm -f "$out"
  zip -q -r "$out" manifest.json content.js content.css popup.html popup.js icons LICENSE
  echo "packaged $out"
}

case "$what" in
  all) shots; zip_ext ;;
  capture) capture ;;
  shots) shots ;;
  zip) zip_ext ;;
  *) echo "usage: $0 [all|capture|shots|zip]" >&2; exit 1 ;;
esac
