import { describe, expect, it } from "vitest";
import type { ColleagueId, TaskId, TaskPlaceId } from "../content/index";
import type { OpenTask, TaskChoice } from "../rules/index";
import { createStore, type GameStore, type SaveStorage } from "../store/index";
import { type ActionCue, type ActionGoal, type ActionStage, createTaskActions } from "./taskActions";

function memoryStorage(): SaveStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

const goalText = (goal: ActionGoal | "home") => (goal === "home" ? "home" : "place" in goal ? goal.place : goal.person);

/** A stage that writes down what each person does. Walks arrive after `walkSeconds` of updates. */
function fakeStage(walkSeconds = 0) {
  const log: string[] = [];
  const walks: { left: number; arrived: () => void }[] = [];
  const walk = (arrived: () => void) => {
    if (walkSeconds === 0) arrived();
    else walks.push({ left: walkSeconds, arrived });
  };
  const stage: ActionStage = {
    internTo(goal, arrived) {
      log.push(`intern walks to ${goalText(goal)}`);
      walk(arrived);
    },
    internPlay(clip) {
      log.push(`intern plays ${clip}`);
    },
    handOff(colleague) {
      log.push(`${colleague} nods`);
    },
    colleagueTo(colleague, goal, arrived) {
      log.push(`${colleague} walks to ${goalText(goal)}`);
      walk(arrived);
    },
    colleagueRest(colleague) {
      log.push(`${colleague} rests`);
    },
    colleaguePlay(colleague, clip) {
      log.push(`${colleague} plays ${clip}`);
    },
  };
  const update = (seconds: number) => {
    for (const w of [...walks]) {
      w.left -= seconds;
      if (w.left <= 0) {
        walks.splice(walks.indexOf(w), 1);
        w.arrived();
      }
    }
  };
  return { stage, log, update };
}

function setUp(walkSeconds = 0) {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.startOver();
  const fake = fakeStage(walkSeconds);
  const cues: ActionCue[] = [];
  const finished: string[] = [];
  store.on("taskActionFinished", (event) => finished.push(event.task.id));
  const actions = createTaskActions(store, fake.stage, (cue) => cues.push(cue));
  const tick = (seconds: number, times = 1) => {
    for (let i = 0; i < times; i++) {
      fake.update(seconds);
      actions.update(seconds);
    }
  };
  return { storage, store, actions, cues, finished, log: fake.log, tick };
}

const openTask = (id: TaskId, extra: Partial<OpenTask> = {}): OpenTask => ({ id, fallout: false, ...extra });

function choose(store: GameStore, task: OpenTask, choice: TaskChoice, colleague?: ColleagueId) {
  // Put the Task on the open list, so any Task can be tried on any day.
  Object.assign(store.state, { openTasks: [task, ...store.state.openTasks] });
  store.chooseTask(task, choice, colleague);
}

describe("Task actions in the office", () => {
  it("walks to the Task place, plays its Do it clip and drains one hour per second before it finishes", () => {
    const { store, actions, cues, finished, log, tick } = setUp(0.5);
    choose(store, store.state.openTasks[0], "do"); // Pan Zbigniew's printer Task

    expect(actions.playing).toBe(true);
    tick(0.25);
    expect(log).toEqual(["intern walks to printer"]);
    tick(0.25);
    expect(log).toEqual(["intern walks to printer", "intern plays interact-left"]);
    tick(1);
    expect(cues).toEqual([{ kind: "drained", hours: 1 }]);
    tick(1, 2);
    expect(cues.filter((cue) => cue.kind === "drained")).toHaveLength(3);
    expect(finished).toEqual(["mon-zbigniew"]);
    expect(actions.playing).toBe(false);
  });

  // The spec's "How Task choices play out" table: place, "Do it" clip, sabotage clip, and a Task there.
  const PLACES: [TaskPlaceId, string, string, TaskId][] = [
    ["desk", "sit", "sit", "wed-ryszard"],
    ["printer", "interact-left", "attack-kick-right", "mon-zbigniew"],
    ["sink", "interact-right", "interact-left", "mon-anyone"],
    ["plant", "pick-up", "attack-kick-left", "tue-anyone"],
    ["shredder", "crouch", "attack-melee-right", "tue-zbigniew"],
    ["room4", "interact-left", "attack-kick-right", "wed-wiola"],
    ["evidenceShelf", "pick-up", "interact-right", "tue-halina"],
  ];

  it.each(PLACES)("plays Do it at the %s with its clip", (place, doClip, _sabotage, id) => {
    const { store, log, tick, finished } = setUp();
    choose(store, openTask(id), "do");
    tick(1, 3);
    expect(log.slice(0, 2)).toEqual([`intern walks to ${place}`, `intern plays ${doClip}`]);
    expect(finished).toEqual([id]);
  });

  it.each(PLACES)("plays Fake it at the %s with the same clip, then a sparkle", (place, doClip, _sabotage, id) => {
    const { store, log, tick, cues, finished } = setUp();
    choose(store, openTask(id), "fake");
    tick(1);
    expect(log.slice(0, 2)).toEqual([`intern walks to ${place}`, `intern plays ${doClip}`]);
    expect(cues).toEqual([
      { kind: "drained", hours: 1 },
      { kind: "looksDone", over: "intern" },
    ]);
    expect(finished).toEqual([id]);
  });

  it.each(PLACES)("plays Sabotage it at the %s with its sabotage clip", (place, _do, sabotageClip, id) => {
    const { store, log, tick, cues, finished } = setUp();
    choose(store, openTask(id), "sabotage");
    tick(1);
    expect(finished).toEqual([]);
    tick(1);
    expect(log.slice(0, 2)).toEqual([`intern walks to ${place}`, `intern plays ${sabotageClip}`]);
    expect(cues.map((cue) => cue.kind)).toEqual(["drained", "drained"]);
    expect(finished).toEqual([id]);
  });

  it("keeps the Intern seated after a desk Task, and stands them up after any other", () => {
    const desk = setUp();
    choose(desk.store, openTask("wed-ryszard"), "do");
    desk.tick(1, 3);
    expect(desk.log).not.toContain("intern plays idle");
    const printer = setUp();
    choose(printer.store, openTask("mon-zbigniew"), "do");
    printer.tick(1, 3);
    expect(printer.log.at(-1)).toBe("intern plays idle");
  });

  it.each(PLACES)("plays Delegate it from the %s: the Intern walks to the Colleague, who nods", (_p, _d, _s, id) => {
    const { store, log, tick, cues, finished } = setUp();
    choose(store, openTask(id), "delegate", "wiola");
    expect(log).toEqual(["intern walks to wiola", "wiola nods"]);
    expect(cues).toEqual([{ kind: "handOff", colleague: "wiola" }]);
    tick(1);
    expect(cues.at(-1)).toEqual({ kind: "drained", hours: 1 });
    expect(finished).toEqual([id]);
  });

  it("frees the Intern while Wiola walks to the Task place, works 3 hours and walks home", () => {
    const { store, actions, log, tick } = setUp();
    choose(store, openTask("mon-zbigniew"), "delegate", "wiola");
    tick(1);
    expect(actions.playing).toBe(false);
    tick(0.01);
    expect(log.slice(-2)).toEqual(["wiola walks to printer", "wiola plays interact-left"]);
    tick(1, 2);
    expect(log.at(-1)).toBe("wiola plays interact-left");
    tick(1);
    expect(log.at(-1)).toBe("wiola walks to home");
  });

  it("has Wiola work where she stands on a desk Task", () => {
    const { store, log, tick } = setUp();
    choose(store, openTask("wed-ryszard"), "delegate", "wiola");
    tick(1, 5);
    expect(log.slice(-2)).toEqual(["wiola plays interact-left", "wiola walks to home"]);
  });

  it("has Kamil take a Launch Team Task to Pani Halina, and do a Paper Trail or no-side Task himself", () => {
    const launch = setUp();
    choose(launch.store, openTask("mon-zbigniew"), "delegate", "kamil");
    launch.tick(1, 2);
    expect(launch.log.slice(-2)).toEqual(["kamil walks to halina", "kamil plays interact-right"]);
    const paper = setUp();
    choose(paper.store, openTask("tue-halina"), "delegate", "kamil");
    paper.tick(1, 2);
    expect(paper.log.slice(-2)).toEqual(["kamil walks to evidenceShelf", "kamil plays pick-up"]);
    const noSide = setUp();
    choose(noSide.store, openTask("mon-anyone"), "delegate", "kamil");
    noSide.tick(1, 2);
    expect(noSide.log.slice(-2)).toEqual(["kamil walks to sink", "kamil plays interact-right"]);
  });

  it("has Ryszard stay where he is and show looks done", () => {
    const { store, log, tick, cues } = setUp();
    choose(store, openTask("mon-zbigniew"), "delegate", "ryszard");
    tick(1, 2);
    expect(log.filter((line) => line.startsWith("ryszard walks"))).toEqual([]);
    expect(cues.at(-1)).toEqual({ kind: "looksDone", over: "ryszard" });
  });

  it("holds a Firing until the action finishes", () => {
    const { store, tick } = setUp();
    const fired: string[] = [];
    store.on("fired", (event) => fired.push(event.pressure));
    Object.assign(store.state.pressures, { performance: 1 });
    choose(store, openTask("mon-zbigniew"), "sabotage");
    tick(1);
    expect(fired).toEqual([]);
    tick(1);
    expect(fired).toEqual(["performance"]);
  });

  it("holds the end of the day until the action finishes", () => {
    const { store, tick } = setUp();
    const ended: number[] = [];
    store.on("dayEnded", (event) => ended.push(event.day));
    Object.assign(store.state, { hoursLeft: 1 });
    choose(store, openTask("mon-anyone"), "fake");
    expect(ended).toEqual([]);
    tick(1);
    expect(ended).toEqual([1]);
  });

  it("loads the finished result when the game reloads during an action", () => {
    const { storage, store } = setUp();
    const task = store.state.openTasks[0];
    store.chooseTask(task, "do");
    const reloaded = createStore(storage);
    expect(reloaded.continueGame()).toBe(true);
    expect(reloaded.state.openTasks).not.toContainEqual(task);
    expect(reloaded.state.pressures).toEqual(store.state.pressures);
    expect(reloaded.state.hoursLeft).toBe(store.state.hoursLeft);
  });
});
