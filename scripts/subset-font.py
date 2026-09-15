# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools[woff]==4.65.0"]
# ///
"""Build the site's WOFF2 character subset from a local Maple Mono TTF."""

import argparse
from html import unescape
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("font", type=Path, help="Path to MapleMono-NF-CN-Regular.ttf")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
sources = [root / "index.html", *root.glob("public/*.html")]
sources += [
    path for path in (root / "src").rglob("*")
    if path.suffix in {".ts", ".tsx", ".css"}
]
# ponytail: includes source comments; parse literals if subset size becomes a concern.
text = "".join(unescape(path.read_text(encoding="utf-8")) for path in sources)
codepoints = {ord(char) for char in text if char.isprintable()} | set(range(32, 127))
font = TTFont(args.font)
missing = codepoints - font.getBestCmap().keys()
if missing:
    print("System font fallback: " + ", ".join(f"U+{code:04X}" for code in sorted(missing)))
codepoints -= missing

options = subset.Options()
options.flavor = "woff2"
options.name_IDs = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=codepoints)
subsetter.subset(font)
font.flavor = "woff2"
output = root / "public/fonts/MapleMono-NF-CN-Regular.woff2"
output.parent.mkdir(parents=True, exist_ok=True)
font.save(output)
font.close()

with TTFont(output) as result:
    assert codepoints <= result.getBestCmap().keys(), "Subset is missing required characters"
    assert result.flavor == "woff2"
print(f"{len(codepoints)} characters; {args.font.stat().st_size:,} -> {output.stat().st_size:,} bytes")
