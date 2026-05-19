"""Point img tags at .svg (works on file://); optional .jpg via load-photos.js."""
import re
from pathlib import Path

CONCEPTS = Path(__file__).resolve().parents[1] / "concepts"
SCRIPT_TAG = '  <script src="../assets/load-photos.js"></script>\n'

pattern = re.compile(
    r'src="(\.\./assets/images/([a-z0-9-]+))\.jpg"([^>]*?)'
    r'(?:\s+onerror="[^"]*")?',
    re.IGNORECASE,
)

for html in CONCEPTS.glob("*.html"):
    text = html.read_text(encoding="utf-8")
    def repl(m: re.Match) -> str:
        base, name, rest = m.group(1), m.group(2), m.group(3)
        rest = re.sub(r'\s+onerror="[^"]*"', "", rest)
        if "data-jpg=" in rest:
            return m.group(0)
        return f'src="{base}.svg" data-jpg="{base}.jpg"{rest}'

    new = pattern.sub(repl, text)
    if SCRIPT_TAG.strip() not in new and "load-photos.js" not in new:
        new = new.replace("</body>", SCRIPT_TAG + "</body>")
    html.write_text(new, encoding="utf-8")
    print("updated", html.name)
