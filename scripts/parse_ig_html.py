import re
from pathlib import Path

html = Path(__file__).resolve().parents[1] / "ig_profile.html"
text = html.read_text(encoding="utf-8", errors="ignore")
codes = list(dict.fromkeys(re.findall(r"instagram\.com/p/([A-Za-z0-9_-]+)", text)))
print("shortcodes", codes[:15])
imgs = list(dict.fromkeys(re.findall(r"https://scontent[^\s\"\\]+", text)))
print("scontent count", len(imgs))
for u in imgs:
    if "150x150" in u or "profile" in u.lower():
        continue
    print(u[:160])
