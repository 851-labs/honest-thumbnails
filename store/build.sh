#!/usr/bin/env bash
# Builds Chrome Web Store assets. Also available as npm scripts (npm run build, etc).
#
#   store/build.sh            render screenshots + promo tile, package the extension zip
#   store/build.sh capture    re-capture live YouTube pages used by the screenshots
#   store/build.sh shots      render screenshots + promo tile only
#   store/build.sh zip        package the extension zip only
#
# Every store/screenshots/<name>.html is rendered at 1280x800 to
# store/screenshot-<name>.png, and every store/promo/<name>-<W>x<H>.html at WxH
# to store/promo-<name>-<W>x<H>.png, using the repo's Playwright dev dependency.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
what="${1:-all}"

setup() {
  [ -x node_modules/.bin/playwright ] || npm install --silent
  npx playwright install chromium >/dev/null
}

shots() {
  setup
  for page in store/screenshots/*.html; do
    name="$(basename "$page" .html)"
    out="store/screenshot-$name.png"
    npx playwright screenshot --viewport-size=1280,800 "file://$ROOT/$page" "$out" >/dev/null
    echo "rendered $out"
  done
  for page in store/promo/*.html; do
    name="$(basename "$page" .html)"            # e.g. small-440x280
    size="${name##*-}"; w="${size%x*}"; h="${size#*x}"
    out="store/promo-$name.png"
    npx playwright screenshot --viewport-size="$w,$h" "file://$ROOT/$page" "$out" >/dev/null
    echo "rendered $out"
  done
}

capture() {
  setup
  node store/capture.cjs
}

zip_ext() {
  version="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' extension/manifest.json)"
  out="$ROOT/store/honest-thumbnails-$version.zip"
  rm -f "$out"
  (cd extension && zip -q -r -X "$out" . -x '.*')
  zip -q -j "$out" LICENSE
  echo "packaged store/$(basename "$out")"
}

case "$what" in
  all) shots; zip_ext ;;
  capture) capture ;;
  shots) shots ;;
  zip) zip_ext ;;
  *) echo "usage: $0 [all|capture|shots|zip]" >&2; exit 1 ;;
esac
