from pathlib import Path

p = Path(__file__).resolve().parents[1] / "concepts" / "index.html"
text = p.read_text(encoding="utf-8")
start = text.index('<div class="community-marquee__group">')
end = text.index("</div>", start)
# first closing div after group opens - wrong, need the group's closing tag
# find by matching the group that contains article class="note"
marker = '<div class="community-marquee__group">'
start = text.index(marker)
pos = start + len(marker)
depth = 1
i = pos
while i < len(text) and depth > 0:
    next_open = text.find("<div", i)
    next_close = text.find("</div>", i)
    if next_close == -1:
        break
    if next_open != -1 and next_open < next_close:
        depth += 1
        i = next_open + 4
    else:
        depth -= 1
        i = next_close + 6
        if depth == 0:
            end = next_close
            break

replacement = '<div class="community-marquee__group" data-community-notes-root></div>'
new_text = text[:start] + replacement + text[end:]
p.write_text(new_text, encoding="utf-8")
print("updated", p)
