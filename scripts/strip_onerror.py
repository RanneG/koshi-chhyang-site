import re
from pathlib import Path

for p in Path(__file__).resolve().parents[1].glob("*.html"):
    t = p.read_text(encoding="utf-8")
    t2 = re.sub(r'\s+onerror="[^"]*"', "", t)
    p.write_text(t2, encoding="utf-8")
    print(p.name)
