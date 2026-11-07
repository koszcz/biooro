"""Throwaway simulator for the intern-game week rules.

It encodes the rules from tickets 07, 08, 17, 19, 20, 21, 22 and 23 so that
the Survivability and the scripted week ticket can check policies.

Run: python3 week_sim.py
"""

from __future__ import annotations

import copy
import itertools
import sys
from functools import lru_cache

PRESSURES = ("P", "LT", "PT", "S")  # Firing priority order.
RIVAL = {"LT": "PT", "PT": "LT"}
COLLEAGUE_FACTION = {"R": "LT", "W": "LT", "K": "PT"}

SLOTS = {
    1: ["LT", None],
    2: ["PT", "LT", None],
    3: ["PT", "LT", "LT"],
    4: ["PT", "LT", "PT", None],
    5: ["LT", "PT", "LT", "LT"],
}

CONFIG = dict(
    start=6,
    hours=8,
    friday_hours=5,
    do_hours=3,
    fallout_hours=4,
    base_tasks=2,
    break_gain=2,
    fake_hours=1,
    fallout_delay=2,
    ignore_cost=3,
)


def clamp(v):
    return max(0, min(10, v))


class Game:
    def __init__(self, cfg=None, conversations=0):
        self.cfg = dict(CONFIG, **(cfg or {}))
        s = self.cfg["start"]
        self.pr = {"P": s, "LT": s, "PT": s, "S": s}
        self.esc = 0
        self.day = 0
        self.hours = 0
        self.tasks = []  # dicts: side, fallout, arrived
        self.pending = []  # (due_day, side)
        self.helped = set()
        self.finished_today = 0
        self.finished_yesterday = 0
        self.fired = None
        self.survived = False
        self.conversations = conversations  # points of gain per day, 0..3
        self.log = []

    # ---------- helpers ----------
    def key(self):
        return (
            tuple(self.pr[p] for p in PRESSURES),
            self.esc,
            self.day,
            self.hours,
            tuple(sorted((t["side"] or "", t["fallout"], t["arrived"]) for t in self.tasks)),
            tuple(sorted((d, s or "") for d, s in self.pending)),
            tuple(sorted(self.helped)),
            self.finished_today,
        )

    def add(self, p, v):
        self.pr[p] = clamp(self.pr[p] + v)

    def check(self, when):
        for p in PRESSURES:
            if self.pr[p] <= 0:
                self.fired = (p, self.day, when)
                return True
        return False

    def help(self, faction):
        if faction is None:
            return
        self.helped.add(faction)

    # ---------- morning ----------
    def morning(self):
        self.day += 1
        self.esc += 1
        if self.day >= 2:
            self.add("S", -1)
        if self.check("morning"):
            return False
        for due, side in [x for x in self.pending if x[0] == self.day]:
            self.tasks.append(dict(side=side, fallout=True, arrived=self.day))
        self.pending = [x for x in self.pending if x[0] != self.day]
        n = min(self.cfg["base_tasks"] + self.finished_yesterday // 2, len(SLOTS[self.day]))
        for side in SLOTS[self.day][:n]:
            self.tasks.append(dict(side=side, fallout=False, arrived=self.day))
        self.hours = self.cfg["friday_hours"] if self.day == 5 else self.cfg["hours"]
        self.helped = set()
        self.finished_today = 0
        # Conversations: upper bound, each point to the lowest of LT, PT, S.
        for _ in range(self.conversations):
            low = min(("LT", "PT", "S"), key=lambda p: self.pr[p])
            self.add(low, 1)
        return True

    # ---------- choices ----------
    def legal(self):
        acts = []
        h = self.hours
        for i, t in enumerate(self.tasks):
            dh = self.cfg["fallout_hours"] if t["fallout"] else self.cfg["do_hours"]
            if dh <= h:
                acts.append(("do", i))
            if not t["fallout"] and h >= self.cfg["fake_hours"]:
                acts.append(("fake", i))
            if h >= 1:
                for c in "RWK":
                    if c == "R" and t["fallout"]:
                        continue
                    if self.pr[COLLEAGUE_FACTION[c]] >= 5:
                        acts.append(("del", i, c))
            if h >= 2:
                acts.append(("sab", i))
        if h >= 1:
            acts.append(("break",))
        acts.append(("home",))
        return acts

    def apply(self, act):
        self.log.append((self.day, act, dict(self.pr)))
        kind = act[0]
        if kind == "home":
            return self.end_of_day()
        if kind == "break":
            self.hours -= 1
            self.add("S", self.cfg["break_gain"])
            return True
        t = self.tasks.pop(act[1])
        side = t["side"]
        gain = 0 if side == "PT" else 1
        if kind == "do":
            self.hours -= self.cfg["fallout_hours"] if t["fallout"] else self.cfg["do_hours"]
            self.add("P", gain)
            if side:
                self.add(side, 1)
            self.add("S", -1)
            self.help(side)
            if side == "PT":
                self.esc += 1
            self.finished_today += 1
        elif kind == "fake":
            self.hours -= self.cfg["fake_hours"]
            self.add("P", gain)
            if self.day + self.cfg["fallout_delay"] <= 5:
                self.pending.append((self.day + self.cfg["fallout_delay"], side))
            self.finished_today += 1
        elif kind == "del":
            self.hours -= 1
            c = act[2]
            self.add(COLLEAGUE_FACTION[c], -1)
            if c == "R":
                self.add("P", gain)
                if self.day + self.cfg["fallout_delay"] <= 5:
                    self.pending.append((self.day + self.cfg["fallout_delay"], side))
            elif c == "W":
                self.add("P", gain)
                if side:
                    self.add(side, 1)
                self.help(side)
                if side == "PT":
                    self.esc += 1
            else:  # Kamil
                if side == "LT":
                    self.add("LT", -1)
                elif side == "PT":
                    self.add("PT", 1)
                self.help("PT")
                self.esc += 1
            self.finished_today += 1
        elif kind == "sab":
            self.hours -= 2
            self.add("P", -1)
            if side:
                self.add(side, -2)
                self.add(RIVAL[side], 1)
                self.help(RIVAL[side])
            self.add("S", 1)
            self.esc += 1
        return not self.check("choice")

    # ---------- end of day ----------
    def end_of_day(self):
        keep = []
        for t in self.tasks:
            if t["fallout"] and t["arrived"] == self.day:
                self.add("P", -self.cfg["ignore_cost"])
                self.esc += 1
            else:
                self.add("P", -1)
                keep.append(t)
        self.tasks = keep
        if self.day >= 2:
            for f in ("LT", "PT"):
                if f not in self.helped:
                    self.add(f, -1)
        self.finished_yesterday = self.finished_today
        self.hours = 0
        if self.check("night"):
            return False
        if self.day == 5:
            # Audit: lift the lower goodwill; never deflect.
            low = min(("LT", "PT"), key=lambda p: self.pr[p])
            self.add(low, 2)
            self.survived = True
        return True


# ---------- policies ----------
def pick(g, kinds_for_task, use_breaks):
    """Generic greedy policy.

    kinds_for_task(g, i, t) returns a preference list of actions for task i.
    Fallout Tasks are handled first. A Break is taken before a "Do it" that
    would drop Sanity to 0. Leftover hours go to Breaks if use_breaks.
    """
    order = sorted(range(len(g.tasks)), key=lambda i: (not g.tasks[i]["fallout"], i))
    legal = set(g.legal())
    for i in order:
        for a in kinds_for_task(g, i, g.tasks[i]):
            if a in legal:
                if a[0] == "do" and g.pr["S"] <= 1 and ("break",) in legal:
                    return ("break",)
                return a
    if use_breaks and ("break",) in legal and g.pr["S"] < 10:
        return ("break",)
    return ("home",)


def always_do(g, i, t):
    return [("do", i)]


def always_fake(g, i, t):
    return [("fake", i), ("do", i)]


def mixed(g, i, t):
    """Do one Task for each Faction not yet helped today. Fake the rest.

    Fallout Tasks: do them. Tasks with no side: fake them.
    """
    if t["fallout"]:
        return [("do", i), ("del", i, "W")]
    side = t["side"]
    if side and side not in g.helped:
        # Reserve hours: do it only if it is the first Task of that side.
        firsts = {}
        for j, u in enumerate(g.tasks):
            if u["side"] and not u["fallout"]:
                firsts.setdefault(u["side"], j)
        if firsts.get(side) == i:
            return [("do", i), ("fake", i)]
    return [("fake", i), ("do", i)]


def run(policy, use_breaks, cfg=None, conv=0, verbose=False):
    g = Game(cfg, conv)
    for _ in range(5):
        if not g.morning():
            break
        while g.hours > 0 or True:
            a = pick(g, policy, use_breaks)
            ok = g.apply(a)
            if a[0] == "home" or not ok:
                break
            if g.hours == 0:
                ok = g.end_of_day()
                break
        if g.fired:
            break
        if verbose:
            print(f"  end D{g.day}: {g.pr} esc={g.esc} open={len(g.tasks)} pending={len(g.pending)}")
    return g


# ---------- exhaustive search ----------
def best_week(cfg=None, conv=0):
    """Max over all play of the minimum Pressure at the end of the week.

    Returns (score, survived_count_hint). Uses memo on state key.
    """
    memo = {}

    def day_outcomes(g):
        """All distinct end-of-day states reachable from a day-start state."""
        seen = {}
        stack = [g]
        out = {}
        while stack:
            s = stack.pop()
            k = s.key()
            if k in seen:
                continue
            seen[k] = True
            for a in s.legal():
                n = copy.deepcopy(s)
                ok = n.apply(a)
                if not ok:
                    continue
                if a[0] == "home" or n.hours == 0:
                    if a[0] != "home":
                        if not n.end_of_day():
                            continue
                    out[n.key()] = n
                else:
                    stack.append(n)
        return list(out.values())

    def solve(g):
        k = g.key()
        if k in memo:
            return memo[k]
        if g.survived:
            r = min(g.pr.values())
        else:
            n = copy.deepcopy(g)
            if not n.morning():
                r = -1
            else:
                r = -1
                for e in day_outcomes(n):
                    r = max(r, solve(e))
        memo[k] = r
        return r

    return solve(Game(cfg, conv))


if __name__ == "__main__":
    pols = [
        ("always do, no Breaks", always_do, False),
        ("always do, Breaks", always_do, True),
        ("always fake, Breaks", always_fake, True),
        ("mixed, Breaks", mixed, True),
    ]
    cfg = {}
    for arg in sys.argv[1:]:
        k, v = arg.split("=")
        cfg[k] = int(v)
    for conv in (0, 3):
        print(f"=== conversations={conv} cfg={cfg}")
        for name, pol, br in pols:
            print(name)
            g = run(pol, br, cfg, conv, verbose=True)
            print("  ->", "FIRED " + str(g.fired) if g.fired else f"SURVIVED {g.pr}")


# ---------- scripted Vitest weeks, written to match ticket 25 exactly ----------
def scripted_mixed(g):
    legal = set(g.legal())

    def do(i):
        if g.pr["S"] <= 1 and ("break",) in legal:
            return ("break",)
        return ("do", i)

    for i, t in enumerate(g.tasks):
        if t["fallout"] and ("do", i) in legal:
            return do(i)
    for i, t in enumerate(g.tasks):
        side = t["side"]
        if t["fallout"] or not side or side in g.helped:
            continue
        first = next(j for j, u in enumerate(g.tasks) if u["side"] == side and not u["fallout"])
        if first == i and ("do", i) in legal:
            return do(i)
    for i, t in enumerate(g.tasks):
        if ("fake", i) in legal:
            return ("fake", i)
    if ("break",) in legal and g.pr["S"] < 10:
        return ("break",)
    return ("home",)


def scripted_do(g):
    legal = set(g.legal())
    for i, t in enumerate(g.tasks):
        if ("do", i) in legal:
            return ("do", i)
    return ("home",)


def scripted_fake(g):
    legal = set(g.legal())
    for i, t in enumerate(g.tasks):
        if ("fake", i) in legal:
            return ("fake", i)
    for i, t in enumerate(g.tasks):
        if t["fallout"] and ("do", i) in legal:
            return ("do", i)
    if ("break",) in legal and g.pr["S"] < 10:
        return ("break",)
    return ("home",)


def run_scripted(policy, cfg=None):
    g = Game(cfg)
    for _ in range(5):
        if not g.morning():
            break
        while True:
            a = policy(g)
            ok = g.apply(a)
            if a[0] == "home" or not ok:
                break
            if g.hours == 0:
                g.end_of_day()
                break
        if g.fired:
            break
    return g
