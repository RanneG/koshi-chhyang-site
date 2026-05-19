"""One-off: extract Uiverse button icons from agent transcript."""
import json
import re
from pathlib import Path

TRANSCRIPT = Path(
    r"C:\Users\ranne\.cursor\projects\c-Users-ranne-Cursor-cursor-linkup-mcp"
    r"\agent-transcripts\4e4e12b1-ae6c-4385-99dc-f81a4158f5b7"
    r"\4e4e12b1-ae6c-4385-99dc-f81a4158f5b7.jsonl"
)
OUT = Path(__file__).resolve().parents[1] / "assets" / "btn-playful-icons.html"

def main() -> None:
    for line in TRANSCRIPT.read_text(encoding="utf-8").splitlines():
        if "icon-1" not in line or "MuhammadHasann" not in line:
            continue
        text = json.loads(line)["message"]["content"][0]["text"]
        start = text.find('<motion.div class="icon-1">')
        if start < 0:
            start = text.find('<div class="icon-1">')
        end = text.find("</button>", start)
        if start < 0 or end < 0:
            raise SystemExit("icon block not found")
        frag = text[start:end]
        frag = re.sub(
            r'class="icon-(\d)"',
            r'class="btn-playful__icon btn-playful__icon--\1"',
            frag,
        )
        frag = frag.replace("<motion.div", "<span").replace("</motion.div>", "</span>")
        frag = frag.replace("<div", "<span").replace("</motion.div>", "</span>")
        # fix any remaining div closers for icon wrappers
        frag = re.sub(r"</div>(\s*<span class=\"btn-playful__icon)", r"</span>\1", frag)
        frag = frag.replace("</div>", "</span>", 3)
        OUT.write_text(frag, encoding="utf-8")
        print(f"wrote {OUT} ({len(frag)} chars)")
        return
    raise SystemExit("transcript line not found")


if __name__ == "__main__":
    main()
