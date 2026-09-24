#!/bin/bash
# Regenerates assets/fonts/jiangcheng-{400,700}.woff2 from the full-size
# source TTFs, subset down to only the characters this site actually uses
# (index.html + js/*.js) — the full font is ~14MB per weight, way too
# heavy for a mobile/China-network site, but a full-CJK subset was still
# ~4MB per weight. Exact-use subsetting brings each weight to a few
# hundred KB instead.
#
# Run this again any time new Chinese text is added anywhere in the site,
# BEFORE committing — otherwise new characters silently fall back to the
# system font.
#
# Source TTFs live in .font-cache/ (git-ignored, not redistributed in the
# repo). If missing, re-download 江城圆体 (Jiangcheng Yuanti, OFL-1.1
# licensed, free for commercial use) from https://www.maoken.com/freefonts/4916.html
# and place the 400W/700W .ttf files there as jiangcheng-{400,700}-source.ttf.

set -euo pipefail
cd "$(dirname "$0")/.."

VENV=/tmp/fontenv
if [ ! -x "$VENV/bin/pyftsubset" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet fonttools brotli
fi

CHARS=$(python3 -c "
import re, glob
text = ''
for path in ['index.html', *glob.glob('js/*.js')]:
    text += open(path, encoding='utf-8').read()
chars = sorted(set(re.findall(r'[一-鿿　-〿＀-￯]', text)))
print(''.join(chars), end='')
")
UNICODES="U+0020-007E,U+2018,U+2019,U+201C,U+201D,U+2026"

for w in 400 700; do
  src=".font-cache/jiangcheng-${w}-source.ttf"
  if [ ! -f "$src" ]; then
    echo "Missing $src — see the comment at the top of this script." >&2
    exit 1
  fi
  "$VENV/bin/pyftsubset" "$src" \
    --output-file="assets/fonts/jiangcheng-${w}.woff2" \
    --flavor=woff2 \
    --unicodes="$UNICODES" \
    --text="$CHARS" \
    --layout-features='*'
  echo "assets/fonts/jiangcheng-${w}.woff2: $(du -h "assets/fonts/jiangcheng-${w}.woff2" | cut -f1)"
done
