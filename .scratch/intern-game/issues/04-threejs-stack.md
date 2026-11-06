# Three.js stack

Type: research
Status: resolved
Blocked by:

## Question

Which Three.js stack suits a small, story-heavy, point-and-click isometric game? Compare vanilla Three.js with Vite and TypeScript against react-three-fiber with drei. For each one, find out:

- How to handle click-to-move with raycasting and simple pathfinding on a floor grid.
- How to lay HTML dialogue and UI panels over the 3D scene.
- How large the result is and how fast it builds.
- How well AI coding agents work with it.

## Answer

Use vanilla Three.js with Vite and TypeScript, and put the dialogue and UI panels in plain HTML over the canvas. Click-to-move needs only one raycast against the floor, and a simple grid A* covers the pathfinding, either written in the project or taken from `pathfinding` or `easystarjs`. In a test build, the vanilla bundle was 132 kB gzipped against 314 kB for react-three-fiber with drei, and both built in under a second. AI agents have far more vanilla Three.js code to learn from, and they avoid r3f traps such as click events passing through objects and state updates every frame. Choose react-three-fiber only if you want React for the whole UI. Full findings are in `research/threejs-stack.md` on branch `research/threejs-stack`, in the worktree at `/Users/hito/code/biooro-research-threejs-stack`.
