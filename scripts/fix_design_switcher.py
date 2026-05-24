"""Fix design-switcher footer blocks on all pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SWITCHER_BLOCK_ROOT = """
  <p class="design-switcher" data-design-switcher>
    <a href="#" data-design-switch-target>View classic site</a>
  </p>
  <script src="assets/design-switcher.js"></script>
"""

SWITCHER_BLOCK_LEGACY = """
  <p class="design-switcher" data-design-switcher>
    <a href="#" data-design-switch-target>View new site</a>
  </p>
  <script src="../assets/design-switcher.js"></script>
"""

PAGES = [
    "index.html",
    "heritage.html",
    "collection.html",
    "business.html",
    "visit.html",
    "events.html",
    "guide.html",
    "stockists.html",
    "legacy/index.html",
    "legacy/heritage.html",
    "legacy/collection.html",
    "legacy/business.html",
]


def main() -> None:
    for rel in PAGES:
        path = ROOT / rel
        html = path.read_text(encoding="utf-8")
        if "data-design-switch-target" in html:
            print(f"  ok {rel}")
            continue
        block = SWITCHER_BLOCK_LEGACY if rel.startswith("legacy/") else SWITCHER_BLOCK_ROOT
        html = re.sub(
            r"</body>\s*</html>\s*$",
            block.strip() + "\n</body>\n</html>\n",
            html,
            count=1,
            flags=re.IGNORECASE,
        )
        path.write_text(html, encoding="utf-8")
        print(f"  fixed {rel}")


if __name__ == "__main__":
    main()
