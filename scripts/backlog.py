#!/usr/bin/env python3
"""Build the backlog web page from the tickets under .scratch/.

Usage: python3 scripts/backlog.py [output-dir]

The output directory defaults to _site/. The script writes one file,
index.html, that holds every effort, its map, its spec, and its tickets.
It needs only the Python standard library. The page renders the Markdown
in the browser.

The GitHub Pages workflow in .github/workflows/backlog.yml runs this
script on every push to main, so the published page stays current.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from frontier import NAME, ROOT, read_ticket  # noqa: E402

TEMPLATE = Path(__file__).resolve().parent / "backlog.html"


def git(*args):
    try:
        return subprocess.run(
            ["git", *args], cwd=ROOT, capture_output=True, text=True, check=True
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return ""


def section(markdown, heading):
    """Return the body under '## heading', up to the next '## ' heading."""
    lines, body, inside = markdown.splitlines(), [], False
    for line in lines:
        if line.startswith("## "):
            if inside:
                break
            inside = line[3:].strip().lower() == heading.lower()
            continue
        if inside:
            body.append(line)
    return "\n".join(body).strip()


def load_effort(effort):
    tickets = []
    for path in sorted((effort / "issues").glob("*.md")):
        match = NAME.match(path.name)
        if not match:
            continue
        title, fields, errors = read_ticket(path)
        blockers = [
            b.strip() for b in fields.get("Blocked by", "").split(",") if b.strip()
        ]
        tickets.append(
            {
                "number": match.group(1),
                "file": path.name,
                "title": title or path.stem,
                "type": fields.get("Type", ""),
                "status": fields.get("Status", ""),
                "blockedBy": blockers,
                "errors": errors,
                "body": path.read_text(),
                "updated": git("log", "-1", "--format=%cI", "--", str(path)),
            }
        )

    by_number = {t["number"]: t for t in tickets}
    for t in tickets:
        waits = [
            b for b in t["blockedBy"]
            if by_number.get(b, {}).get("status") != "resolved"
        ]
        t["waitsOn"] = waits
        t["blocks"] = [o["number"] for o in tickets if t["number"] in o["blockedBy"]]
        if t["status"] == "resolved":
            t["column"] = "resolved"
        elif t["status"] == "claimed":
            t["column"] = "claimed"
        elif waits:
            t["column"] = "blocked"
        else:
            t["column"] = "frontier"

    docs = {}
    for name in ("map.md", "spec.md"):
        path = effort / name
        if path.exists():
            docs[name] = path.read_text()

    map_text = docs.get("map.md", "")
    first = map_text.splitlines()[0] if map_text else ""
    return {
        "slug": effort.name,
        "title": first[2:].strip() if first.startswith("# ") else effort.name,
        "destination": section(map_text, "Destination"),
        "docs": docs,
        "tickets": tickets,
    }


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "_site"
    efforts = sorted(p.parent for p in (ROOT / ".scratch").glob("*/map.md"))
    data = {
        "efforts": [load_effort(e) for e in efforts],
        "commit": git("rev-parse", "--short", "HEAD"),
        "built": git("log", "-1", "--format=%cI"),
        "repo": "koszcz/biooro",
    }
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = TEMPLATE.read_text().replace("/*DATA*/null", payload)
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(html)
    (out / ".nojekyll").write_text("")
    count = sum(len(e["tickets"]) for e in data["efforts"])
    print(f"Wrote {out / 'index.html'} with {count} tickets")


if __name__ == "__main__":
    main()
