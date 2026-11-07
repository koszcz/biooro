"""Random-play search for a 'Retry yesterday' trap.

Plays random weeks. On each morning Firing, replays the previous day from its
snapshot with a full search and checks that some line of play survives the
next morning. Prints any trap found.
"""
import copy, random, sys
import week_sim as w

def day_survivors(snap):
    """Does any play of the snapshot's day reach the next day start alive?"""
    seen = set()
    stack = [snap]
    while stack:
        s = stack.pop()
        k = s.key()
        if k in seen:
            continue
        seen.add(k)
        for a in s.legal():
            n = copy.deepcopy(s)
            if not n.apply(a):
                continue
            if a[0] == "home" or n.hours == 0:
                if a[0] != "home" and not n.end_of_day():
                    continue
                if n.fired:
                    continue
                m = copy.deepcopy(n)
                if n.day == 5 or m.morning():
                    return True
            else:
                stack.append(n)
    return False

random.seed(int(sys.argv[1]) if len(sys.argv) > 1 else 0)
runs = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
morning_firings = traps = survived = 0
for r in range(runs):
    g = w.Game()
    snap = None
    while g.day < 5 and not g.fired:
        if not g.morning():
            morning_firings += 1
            if not day_survivors(snap):
                traps += 1
                print("TRAP", snap.day, snap.pr, len(snap.tasks), snap.pending)
            break
        snap = copy.deepcopy(g)
        while True:
            acts = g.legal()
            a = random.choice(acts)
            ok = g.apply(a)
            if not ok:
                break
            if a[0] == "home" or g.hours == 0:
                if a[0] != "home":
                    g.end_of_day()
                break
    if g.survived:
        survived += 1
print(f"runs={runs} survived={survived} morning_firings={morning_firings} traps={traps}")
