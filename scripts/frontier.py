#!/usr/bin/env python3
"""Print the wayfinder frontier for a map, and check the ticket headers.

Usage: python3 scripts/frontier.py [.scratch/<effort>]
With no argument, it checks every effort under .scratch/ that has a map.md.

For each effort it prints:
- FRONTIER: open, unblocked, unclaimed tickets, first by number first.
- CLAIMED: tickets someone is working on now.
- BLOCKED: open tickets that wait on unresolved tickets.
- the count of resolved tickets.

It exits with status 1 if a ticket header is malformed.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TYPES = {"research", "prototype", "grilling", "task"}
STATUSES = {"open", "claimed", "resolved"}
NAME = re.compile(r"^(\d{2})-[a-z0-9-]+\.md$")


def read_ticket(path):
    """Return (title, fields, errors) for one ticket file."""
    lines = path.read_text().splitlines()[:10]
    title = lines[0][2:].strip() if lines and lines[0].startswith("# ") else None
    fields = {}
    for line in lines:
        for key in ("Type", "Status", "Blocked by"):
            if line.startswith(key + ":"):
                fields[key] = line[len(key) + 1:].strip()
    errors = []
    if not title:
        errors.append("first line is not a '# Title' heading")
    if fields.get("Type") not in TYPES:
        errors.append(f"Type must be one of {sorted(TYPES)}")
    if fields.get("Status") not in STATUSES:
        errors.append(f"Status must be one of {sorted(STATUSES)}")
    if "Blocked by" not in fields:
        errors.append("missing 'Blocked by:' line (leave it empty when nothing blocks)")
    return title, fields, errors


def check_effort(effort):
    issues = effort / "issues"
    tickets = {}
    errors = []
    for path in sorted(issues.glob("*.md")):
        match = NAME.match(path.name)
        if not match:
            errors.append(f"{path.name}: name must be NN-<slug>.md")
            continue
        title, fields, problems = read_ticket(path)
        errors += [f"{path.name}: {p}" for p in problems]
        blockers = [b.strip() for b in fields.get("Blocked by", "").split(",") if b.strip()]
        tickets[match.group(1)] = (path.name, title, fields, blockers)

    for number, (name, _, _, blockers) in tickets.items():
        for b in blockers:
            if b not in tickets:
                errors.append(f"{name}: blocked by {b}, but no ticket {b} exists")

    def resolved(number):
        return number in tickets and tickets[number][2].get("Status") == "resolved"

    frontier, claimed, blocked, done = [], [], [], 0
    for number, (name, title, fields, blockers) in sorted(tickets.items()):
        status = fields.get("Status")
        line = f"  {name}  {title}  [{fields.get('Type')}]"
        if status == "resolved":
            done += 1
        elif status == "claimed":
            claimed.append(line)
        elif all(resolved(b) for b in blockers):
            frontier.append(line)
        else:
            waits = ", ".join(b for b in blockers if not resolved(b))
            blocked.append(f"{line}  waits on {waits}")

    print(f"== {effort.relative_to(ROOT)}")
    for label, rows in (("FRONTIER", frontier), ("CLAIMED", claimed), ("BLOCKED", blocked)):
        print(f"{label}: {len(rows)}")
        for row in rows:
            print(row)
    print(f"RESOLVED: {done}")
    for e in errors:
        print(f"ERROR {e}")
    return not errors


def main():
    if len(sys.argv) > 1:
        efforts = [Path(sys.argv[1]).resolve()]
    else:
        efforts = sorted(p.parent for p in (ROOT / ".scratch").glob("*/map.md"))
    ok = all([check_effort(e) for e in efforts])
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
