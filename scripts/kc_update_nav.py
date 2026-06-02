"""Remove Visit nav link; point legacy visit.html links at events launch section."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"archive", "visit.html", "tickets.html", "thank-you.html"}

PAGES = [
    "index.html",
    "events.html",
    "collection.html",
    "heritage.html",
    "business.html",
    "guide.html",
    "stockists.html",
    "how-to-store.html",
    "how-to-order.html",
    "how-to-drink.html",
]


def patch(text: str, path: str) -> str:
    text = text.replace(
        ' <a href="visit.html">Visit</a>\n',
        "\n",
    )
    text = text.replace(
        ' <a href="visit.html" aria-current="page">Visit</a>\n',
        "\n",
    )
    text = text.replace('href="visit.html"', 'href="events.html#launch"')
    text = text.replace(
        'href="events.html#launch#launch-schedule"',
        'href="events.html#launch-schedule"',
    )
    if path == "index.html":
        text = text.replace(
            """      <a
        href="https://buy.stripe.com/test_9B64gA4Ti1OB1Rd9UebQY00"
        class="site-nav__cta"
        target="_blank"
        rel="noopener noreferrer"
      >Tickets</a>""",
            '      <a href="events.html#launch" class="site-nav__cta">Tickets</a>',
        )
    return text


def main() -> None:
    for name in PAGES:
        path = ROOT / name
        if not path.is_file():
            continue
        original = path.read_text(encoding="utf-8")
        updated = patch(original, name)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            print("updated", name)


if __name__ == "__main__":
    main()
