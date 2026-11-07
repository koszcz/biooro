// PROTOTYPE, throwaway. The office scene from the office-look prototype, locked to the chosen look
// (true isometric angle, low near-wall stubs). Its HUD and switcher are hidden. It exposes actor screen positions.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ---------- variants ----------
type Variant = { key: string; name: string; elevation: number; zoom: number; walls: 'back-only' | 'stubs' | 'fade'; rotatable: boolean };
const VARIANTS: Variant[] = [{ key: 'chosen', name: 'Chosen look', elevation: 35.264, zoom: 1, walls: 'stubs', rotatable: false }];
const params = new URLSearchParams(location.search);
let vIndex = 0;
let variant = VARIANTS[vIndex];

// ---------- room ----------
const W = 10, D = 8, WALL_H = 1.3, STUB_H = 0.2, WALL_T = 0.15;

// ---------- three setup ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#2b3038');
scene.add(new THREE.HemisphereLight('#fff6e8', '#5a5f6b', 1.4));
const sun = new THREE.DirectionalLight('#ffffff', 2.2);
sun.position.set(W * 0.8, 12, D * 1.2);
sun.target.position.set(W / 2, 0, D / 2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
scene.add(sun, sun.target);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
let yawStep = 0; // 0..3, 90° steps; 0 looks from +x,+z toward the room
let zoomMul = 1;
const target = new THREE.Vector3(W / 2, 0.6, D / 2);

function placeCamera() {
  const yaw = THREE.MathUtils.degToRad(45 + yawStep * 90);
  const el = THREE.MathUtils.degToRad(variant.elevation);
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el));
  camera.position.copy(target).addScaledVector(dir, 60);
  camera.lookAt(target);
  const halfH = 4 / (variant.zoom * zoomMul);
  const aspect = innerWidth / innerHeight;
  Object.assign(camera, { left: -halfH * aspect, right: halfH * aspect, top: halfH, bottom: -halfH });
  camera.updateProjectionMatrix();
}

// ---------- floor + walls ----------
const flat = (c: string) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.9 });
const floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, D), flat('#d8c9a8'));
floor.position.set(W / 2, -0.05, D / 2);
floor.receiveShadow = true;
floor.userData.kind = 'floor';
scene.add(floor);
// checker carpet tiles so grid cells read at a glance
for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) if ((x + z) % 2 === 0) {
  const t = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flat('#cfbf9c'));
  t.rotation.x = -Math.PI / 2; t.position.set(x + 0.5, 0.002, z + 0.5); t.receiveShadow = true; t.raycast = () => {};
  scene.add(t);
}

type Wall = { mesh: THREE.Mesh; normal: THREE.Vector3; mat: THREE.MeshStandardMaterial; side: string };
const walls: Wall[] = [];
function makeWall(side: string, x: number, z: number, len: number, alongX: boolean, normal: THREE.Vector3) {
  const mat = new THREE.MeshStandardMaterial({ color: '#b9d3c4', flatShading: true, roughness: 0.95, transparent: true });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(alongX ? len : WALL_T, 1, alongX ? WALL_T : len), mat);
  mesh.position.set(x, 0, z);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.raycast = () => {};
  scene.add(mesh);
  // skirting board + window strip so walls aren't flat slabs
  walls.push({ mesh, normal, mat, side });
}
makeWall('north', W / 2, -WALL_T / 2, W + WALL_T * 2, true, new THREE.Vector3(0, 0, -1));
makeWall('south', W / 2, D + WALL_T / 2, W + WALL_T * 2, true, new THREE.Vector3(0, 0, 1));
makeWall('west', -WALL_T / 2, D / 2, D, false, new THREE.Vector3(-1, 0, 0));
makeWall('east', W + WALL_T / 2, D / 2, D, false, new THREE.Vector3(1, 0, 0));

function setWallHeight(w: Wall, h: number) {
  w.mesh.visible = h > 0;
  w.mesh.scale.y = Math.max(h, 0.001);
  w.mesh.position.y = h / 2;
}
function camDirFlat() {
  const yaw = THREE.MathUtils.degToRad(45 + yawStep * 90);
  return new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
}
function applyWalls() {
  const toCam = camDirFlat();
  for (const w of walls) {
    const near = w.normal.dot(toCam) > 0.1;
    w.mat.opacity = 1;
    if (variant.walls === 'back-only') setWallHeight(w, near ? 0 : WALL_H);
    else if (variant.walls === 'stubs') setWallHeight(w, near ? STUB_H : WALL_H);
    else setWallHeight(w, WALL_H); // fade handled per frame
  }
}
function fadeWalls(dt: number) {
  if (variant.walls !== 'fade') return;
  const toCam = camDirFlat();
  for (const w of walls) {
    const near = w.normal.dot(toCam) > 0.1;
    const goal = near ? 0.12 : 1;
    w.mat.opacity += (goal - w.mat.opacity) * Math.min(1, dt * 8);
    w.mat.depthWrite = w.mat.opacity > 0.9;
    w.mesh.castShadow = w.mat.opacity > 0.9;
  }
}

// ---------- assets ----------
const loader = new GLTFLoader();
let manifest: { furniture: string[]; characters: string[] } = { furniture: [], characters: [] };
const report: Record<string, string> = {};

function pickFile(list: string[], candidates: string[]): string | undefined {
  const lower = list.map((f) => f.toLowerCase());
  for (const c of candidates) {
    const i = lower.indexOf(c.toLowerCase() + '.glb');
    if (i >= 0) return list[i];
  }
  for (const c of candidates) {
    const i = lower.findIndex((f) => f.includes(c.toLowerCase()));
    if (i >= 0) return list[i];
  }
}
async function loadGlb(path: string) {
  const g = await loader.loadAsync(path);
  g.scene.traverse((o: any) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  return g;
}
function box(w: number, h: number, d: number, c: string) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), flat(c));
  m.position.y = h / 2; m.castShadow = m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
const sizeOf = (o: THREE.Object3D) => new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());

type Item = { kind: string; candidates: string[]; fallback: [number, number, number, string]; cell: [number, number]; rot: number; blocks: boolean };
const ITEMS: Item[] = [
  ...[2, 4, 6].flatMap((x): Item[] => [
    { kind: 'desk', candidates: ['desk'], fallback: [1, 0.75, 0.6, '#9b7653'], cell: [x, 2], rot: 0, blocks: true },
    { kind: 'screen', candidates: ['computerScreen', 'screen'], fallback: [0.5, 0.35, 0.08, '#333'], cell: [x, 2], rot: 0, blocks: false },
    { kind: 'chair', candidates: ['chairDesk', 'chair'], fallback: [0.5, 0.45, 0.5, '#456'], cell: [x, 3], rot: Math.PI, blocks: false },
  ]),
  { kind: 'desk', candidates: ['deskCorner', 'desk'], fallback: [1.2, 0.75, 0.8, '#6d4c33'], cell: [8, 6], rot: Math.PI, blocks: true },
  { kind: 'chair', candidates: ['chairDesk', 'chair'], fallback: [0.5, 0.45, 0.5, '#644'], cell: [8, 7], rot: 0, blocks: false },
  { kind: 'toilet', candidates: ['toilet'], fallback: [0.45, 0.5, 0.65, '#f4f4f4'], cell: [1, 6], rot: Math.PI / 2, blocks: true },
  { kind: 'toilet', candidates: ['toiletSquare', 'toilet'], fallback: [0.45, 0.5, 0.65, '#f4f4f4'], cell: [1, 7], rot: Math.PI / 2, blocks: true },
  { kind: 'sink', candidates: ['bathroomSink', 'sink'], fallback: [0.5, 0.85, 0.4, '#e8e8e8'], cell: [0, 4], rot: Math.PI / 2, blocks: true },
  { kind: 'plant', candidates: ['pottedPlant', 'plant'], fallback: [0.4, 0.9, 0.4, '#4a7'], cell: [9, 0], rot: 0, blocks: true },
  { kind: 'bookcase', candidates: ['bookcaseClosed', 'bookcase'], fallback: [1, 1.8, 0.4, '#8a6a4a'], cell: [0, 0], rot: 0, blocks: true },
  { kind: 'trash', candidates: ['trashcan', 'trash'], fallback: [0.3, 0.4, 0.3, '#777'], cell: [7, 2], rot: 0, blocks: true },
  // ticket "How Task choices play out": the kits have no printer, so makePrinter() builds one from boxes.
  { kind: 'printer', candidates: [], fallback: [0.7, 0.75, 0.55, '#c9ced6'], cell: [9, 4], rot: 0, blocks: true },
];

const blocked = new Set<string>();
const chairs: { obj: THREE.Object3D; cell: [number, number]; rot: number }[] = [];
const clickables: THREE.Object3D[] = [floor];

async function buildFurniture() {
  for (const it of ITEMS) {
    const file = pickFile(manifest.furniture, it.candidates);
    let obj: THREE.Object3D;
    if (file) { obj = (await loadGlb(`/kenney/furniture/${file}`)).scene; report[it.kind] ??= file; }
    else if (it.kind === 'printer') { obj = makePrinter(); report.printer = 'built in code'; }
    else { obj = box(...it.fallback); report[it.kind] ??= 'box stand-in'; }
    obj.position.set(it.cell[0] + 0.5, it.kind === 'screen' ? sizeOfDeskTop() : 0, it.cell[1] + 0.5);
    obj.rotation.y = it.rot;
    obj.userData.kind = it.kind;
    scene.add(obj);
    if (it.blocks) blocked.add(it.cell.join(','));
    if (it.kind === 'chair') { chairs.push({ obj, cell: it.cell, rot: it.rot }); clickables.push(obj); }
    if (it.kind === 'desk' && !deskHeight) deskHeight = sizeOf(obj).y;
    if (it.kind === 'chair' && !chairHeight) chairHeight = sizeOf(obj).y;
  }
}
let deskHeight = 0, chairHeight = 0;
/** A floor-standing office copier built from boxes, in the Kenney palette. The front faces +z, toward the camera.
 *  About 0.66 wide, 1.0 tall and 0.56 deep, so it sits beside the Kenney desks at native scale. */
function makePrinter() {
  const g = new THREE.Group();
  const part = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rx = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), flat(c));
    m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  part(0.66, 0.06, 0.54, '#3a3f48', 0, 0.03, 0);           // plinth
  part(0.62, 0.5, 0.52, '#aeb4bc', 0, 0.31, 0);            // paper cabinet
  for (const y of [0.2, 0.42]) {                             // two paper drawers
    part(0.56, 0.005, 0.01, '#6b717a', 0, y + 0.1, 0.262);
    part(0.16, 0.03, 0.03, '#3a3f48', 0, y, 0.27);           // drawer handle
  }
  part(0.62, 0.3, 0.52, '#e3e6ea', 0, 0.71, 0);            // print engine
  part(0.5, 0.03, 0.04, '#2b2f36', -0.02, 0.66, 0.26);     // output slot
  part(0.36, 0.012, 0.22, '#ffffff', -0.02, 0.665, 0.33, -0.12); // a sheet half out of the slot
  part(0.66, 0.06, 0.56, '#cdd2d8', 0, 0.89, 0);           // scanner lid
  part(0.24, 0.04, 0.12, '#3a3f48', 0.2, 0.93, 0.2, -0.35); // control panel
  const led = part(0.03, 0.012, 0.03, '#4ade80', 0.27, 0.955, 0.24, -0.35);
  (led.material as THREE.MeshStandardMaterial).emissive = new THREE.Color('#22c55e');
  part(0.08, 0.04, 0.03, '#f59e0b', 0.15, 0.955, 0.24, -0.35); // the "jam" warning light
  return g;
}
const sizeOfDeskTop = () => deskHeight || 0.75;

// ---------- characters ----------
type Actor = { root: THREE.Object3D; mixer?: THREE.AnimationMixer; clips: THREE.AnimationClip[]; current?: THREE.AnimationAction; height: number };
let intern: Actor;
let charScale = Number(params.get('charScale') ?? 1);

async function makeActor(fileIndex: number, color: string): Promise<Actor> {
  const files = manifest.characters.filter((f) => !/texture|colormap/i.test(f));
  const file = files[fileIndex % Math.max(1, files.length)];
  if (file) {
    const g = await loadGlb(`/kenney/characters/${file}`);
    const root = new THREE.Group(); root.add(g.scene);
    report[`character ${fileIndex}`] = file;
    const a: Actor = { root, clips: g.animations, mixer: new THREE.AnimationMixer(g.scene), height: sizeOf(g.scene).y };
    return a;
  }
  const root = new THREE.Group();
  const body = box(0.35, 0.9, 0.25, color); root.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), flat('#f0c8a0'));
  head.position.y = 1.07; head.castShadow = true; root.add(head);
  report[`character ${fileIndex}`] = 'box stand-in';
  return { root, clips: [], height: 1.24 };
}
function play(a: Actor, pattern: RegExp) {
  if (!a.mixer) return;
  const clip = a.clips.find((c) => pattern.test(c.name));
  if (!clip) return;
  const next = a.mixer.clipAction(clip);
  if (a.current === next) return;
  next.reset().fadeIn(0.2).play();
  a.current?.fadeOut(0.2);
  a.current = next;
}

// ---------- grid A* ----------
type Cell = [number, number];
const key = (c: Cell) => c.join(',');
function astar(start: Cell, goal: Cell): Cell[] {
  const open = new Map<string, { c: Cell; g: number; f: number }>();
  const came = new Map<string, string>();
  const gScore = new Map<string, number>([[key(start), 0]]);
  const h = (c: Cell) => Math.hypot(c[0] - goal[0], c[1] - goal[1]);
  open.set(key(start), { c: start, g: 0, f: h(start) });
  while (open.size) {
    let bestK = '', best: any;
    for (const [k, n] of open) if (!best || n.f < best.f) { best = n; bestK = k; }
    open.delete(bestK);
    if (bestK === key(goal)) {
      const path: Cell[] = [best.c]; let k = bestK;
      while (came.has(k)) { k = came.get(k)!; path.unshift(k.split(',').map(Number) as Cell); }
      return path;
    }
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const n: Cell = [best.c[0] + dx, best.c[1] + dz];
      if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= D || blocked.has(key(n))) continue;
      if (dx && dz && (blocked.has(key([best.c[0] + dx, best.c[1]])) || blocked.has(key([best.c[0], best.c[1] + dz])))) continue; // no corner cutting
      const g = best.g + (dx && dz ? Math.SQRT2 : 1);
      if (g < (gScore.get(key(n)) ?? Infinity)) {
        gScore.set(key(n), g); came.set(key(n), bestK);
        open.set(key(n), { c: n, g, f: g + h(n) });
      }
    }
  }
  return [];
}

// ---------- movement ----------
let path: THREE.Vector3[] = [];
let sitOn: (typeof chairs)[number] | null = null;
let seated = false;
const SPEED = 2.4;
let marker: THREE.Mesh;
let arrived: (() => void) | null = null;

function cellOf(p: THREE.Vector3): Cell { return [Math.floor(p.x), Math.floor(p.z)]; }
function walkTo(goal: Cell, chair: (typeof chairs)[number] | null = null) {
  arrived = null; // a new walk drops whoever waited on the old one
  const from = cellOf(intern.root.position);
  const cells = astar(from, goal);
  if (!cells.length) return;
  seated = false;
  intern.root.position.y = 0;
  path = cells.slice(1).map((c) => new THREE.Vector3(c[0] + 0.5, 0, c[1] + 0.5));
  if (chair) path.push(new THREE.Vector3(chair.cell[0] + 0.5, 0, chair.cell[1] + 0.5));
  sitOn = chair;
  marker.position.set(goal[0] + 0.5, 0.01, goal[1] + 0.5);
  marker.visible = true;
}
function updateIntern(dt: number) {
  if (!path.length) return;
  const p = intern.root.position;
  const next = path[0];
  const to = next.clone().sub(p); to.y = 0;
  const dist = to.length();
  const step = SPEED * dt;
  if (dist > 0.001) intern.root.rotation.y = Math.atan2(to.x, to.z);
  play(intern, /walk/i);
  if (dist <= step) { p.copy(next); path.shift(); } else p.addScaledVector(to.normalize(), step);
  if (!path.length) {
    marker.visible = false;
    arrived?.(); arrived = null;
    if (sitOn) {
      seated = true;
      intern.root.rotation.y = sitOn.rot + Math.PI; // face the desk
      // Raise to seat height only if there is no sit clip to do it for us.
      const hasSit = intern.clips.some((c) => /sit/i.test(c.name));
      intern.root.position.y = hasSit ? 0 : (chairHeight || 0.45) * 0.45;
      play(intern, /sit/i);
    } else play(intern, /idle/i);
  }
}

// ---------- input ----------
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (hooks.locked) return;
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const actors = actorMap();
  for (const [who, a] of Object.entries(actors) as [Who, Actor][]) {
    if (who === 'intern' || !a) continue;
    if (ray.intersectObject(a.root, true).length && hooks.onActorClick) { hooks.onActorClick(who); return; }
  }
  const hit = ray.intersectObjects(clickables, true)[0];
  if (!hit) return;
  let o: THREE.Object3D | null = hit.object;
  while (o && !o.userData.kind) o = o.parent;
  if (o?.userData.kind === 'chair') {
    const chair = chairs.find((c) => c.obj === o)!;
    // approach from the cell behind the chair (away from desk)
    const behind: Cell = [chair.cell[0], chair.cell[1] + (chair.rot === 0 ? 1 : 1)];
    const approach: Cell = behind[1] < D && !blocked.has(key(behind)) ? behind : chair.cell;
    hooks.onPlayerWalk?.();
    walkTo(approach, chair);
  } else {
    const c = cellOf(hit.point);
    if (!blocked.has(key(c))) { hooks.onPlayerWalk?.(); walkTo(c); }
  }
});
// Hover: pointer cursor over people, and tell the UI who is under the mouse.
let hovered: Who | null = null;
renderer.domElement.addEventListener('pointermove', (e) => {
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  let hit: Who | null = null;
  if (!hooks.locked && intern) for (const [who, a] of Object.entries(actorMap()) as [Who, Actor][]) {
    if (who !== 'intern' && a && ray.intersectObject(a.root, true).length) { hit = who; break; }
  }
  renderer.domElement.style.cursor = hit ? 'pointer' : '';
  if (hit !== hovered) { hovered = hit; hooks.onActorHover?.(hit); }
});
renderer.domElement.addEventListener('wheel', (e) => { zoomMul = THREE.MathUtils.clamp(zoomMul * (e.deltaY > 0 ? 0.9 : 1.1), 0.5, 3); placeCamera(); });
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); placeCamera(); });
addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (t.matches('input,textarea,[contenteditable]')) return;
  if (variant.rotatable && (e.key === 'q' || e.key === 'e')) { yawStep = (yawStep + (e.key === 'e' ? 1 : 3)) % 4; placeCamera(); applyWalls(); }
});

// ---------- switcher ----------
function setVariant(i: number) {
  vIndex = (i + VARIANTS.length) % VARIANTS.length;
  variant = VARIANTS[vIndex];
  if (!variant.rotatable) yawStep = 0;
  zoomMul = 1;
  placeCamera(); applyWalls();
  if (intern) renderHud();
}
document.getElementById('prev')!.onclick = () => setVariant(vIndex - 1);
document.getElementById('next')!.onclick = () => setVariant(vIndex + 1);

// ---------- HUD (surfaces state) ----------
const hud = document.getElementById('hud')!;
function renderHud() {
  document.getElementById('vlabel')!.textContent = `${variant.key} (${variant.name})`;
  const usingModels = manifest.furniture.length + manifest.characters.length > 0;
  const ratio = deskHeight ? (intern.height * charScale) / deskHeight : 0;
  const sitClips = intern.clips.filter((c) => /sit/i.test(c.name)).map((c) => c.name);
  hud.innerHTML = `
    <h1>PROTOTYPE · Isometric office look</h1>
    ${usingModels ? '' : '<div class="warn">No Kenney models found. Box stand-ins shown. Run pnpm unpack.</div>'}
    <table>
      <tr><td>Variant</td><td>${variant.key} – ${variant.name}</td></tr>
      <tr><td>Camera</td><td>elev ${variant.elevation}°, yaw ${45 + yawStep * 90}°, zoom ×${(variant.zoom * zoomMul).toFixed(2)}${variant.rotatable ? ' (Q/E rotate)' : ''}</td></tr>
      <tr><td>Walls</td><td>${variant.walls}</td></tr>
      <tr><td>Intern</td><td>cell ${cellOf(intern.root.position).join(',')}, ${seated ? 'seated' : path.length ? `walking (${path.length} steps left)` : 'standing'}</td></tr>
    </table>
    <b>Scale check</b>
    <table>
      <tr><td>Character height</td><td>${(intern.height * charScale).toFixed(2)} (×${charScale})</td></tr>
      <tr><td>Desk height</td><td>${deskHeight.toFixed(2)}</td></tr>
      <tr><td>Chair height</td><td>${chairHeight.toFixed(2)}</td></tr>
      <tr><td>Char ÷ desk</td><td>${ratio.toFixed(2)} <span style="color:#666">(real people ≈ 2.3)</span></td></tr>
    </table>
    Char scale <input id="cs" type="range" min="0.2" max="4" step="0.05" value="${charScale}">
    <div><b>Animation clips (${intern.clips.length})</b> – sit clip: ${sitClips.length ? sitClips.join(', ') : '<span class="warn">none found</span>'}</div>
    <div>${intern.clips.map((c, i) => `<button data-clip="${i}">${c.name}</button>`).join('')}</div>
    <div style="color:#666;margin-top:4px">Assets: ${Object.entries(report).map(([k, v]) => `${k}=${v}`).join(', ')}</div>`;
  (hud.querySelector('#cs') as HTMLInputElement).oninput = (e) => {
    charScale = Number((e.target as HTMLInputElement).value);
    intern.root.scale.setScalar(charScale); colleague.root.scale.setScalar(charScale); boss.root.scale.setScalar(charScale);
  };
  hud.querySelectorAll<HTMLButtonElement>('button[data-clip]').forEach((b) => (b.onclick = () => {
    const c = intern.clips[Number(b.dataset.clip)];
    play(intern, new RegExp(`^${c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  }));
}

// ---------- boot ----------
let colleague: Actor, boss: Actor, halina: Actor, wiola: Actor, kamil: Actor;
async function boot() {
  try { manifest = await (await fetch('/kenney/manifest.json')).json(); } catch { /* boxes */ }
  await buildFurniture();
  intern = await makeActor(0, '#e8a33d');
  colleague = await makeActor(1, '#5a8fd6');
  boss = await makeActor(2, '#8c3b3b');
  halina = await makeActor(7, '#7a5aa8'); wiola = await makeActor(4, '#4aa86a'); kamil = await makeActor(9, '#a8864a');
  halina.root.position.set(1.5, 0, 2.5); wiola.root.position.set(2.5, 0, 4.5); kamil.root.position.set(3.5, 0, 6.5);
  halina.root.rotation.y = Math.PI / 2; kamil.root.rotation.y = Math.PI;
  intern.root.position.set(4.5, 0, 5.5);
  colleague.root.position.set(6.5, 0, 5.5); colleague.root.rotation.y = -Math.PI / 2;
  boss.root.position.set(8.5, 0, 7.5); boss.root.rotation.y = Math.PI;
  for (const a of [intern, colleague, boss, halina, wiola, kamil]) { a.root.scale.setScalar(charScale); scene.add(a.root); play(a, /idle/i); homes.set(a, { pos: a.root.position.clone(), rot: a.root.rotation.y }); }
  marker = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.35, 24), new THREE.MeshBasicMaterial({ color: '#ff2bd6' }));
  marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
  setVariant(vIndex);
  renderHud();
  let hudT = 0;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    updateIntern(dt);
    updateNpcs(dt);
    fadeWalls(dt);
    for (const a of [intern, colleague, boss, halina, wiola, kamil]) a.mixer?.update(dt);
    onFrame.forEach((f) => f());
    renderer.render(scene, camera);
  });
}
boot();

// ---------- exports for the UI prototype ----------
export const onFrame: (() => void)[] = [];
export type Who = 'intern' | 'zbigniew' | 'ryszard' | 'halina' | 'wiola' | 'kamil';
export function screenPos(who: Who): { x: number; y: number } | null {
  const a = { intern, zbigniew: boss, ryszard: colleague, halina, wiola, kamil }[who];
  if (!a) return null;
  const v = a.root.position.clone(); v.y += 0.95;
  v.project(camera);
  return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
}

// ---------- conversation hooks (ticket "Conversation interface") ----------
export const hooks: { locked: boolean; onActorClick: ((who: Who) => void) | null; onActorHover?: (who: Who | null) => void; onPlayerWalk?: () => void } = { locked: false, onActorClick: null };
function actorMap(): Record<Who, Actor> { return { intern, zbigniew: boss, ryszard: colleague, halina, wiola, kamil }; }
/** Walk the Intern to a free cell next to `who`, then face them. Resolves on arrival. */
export function walkNear(who: Who): Promise<void> {
  const a = actorMap()[who].root, me = intern.root;
  const target = cellOf(a.position), here = cellOf(me.position);
  const face = () => { me.rotation.y = Math.atan2(a.position.x - me.position.x, a.position.z - me.position.z); };
  const near = (c: Cell) => Math.max(Math.abs(c[0] - target[0]), Math.abs(c[1] - target[1])) <= 1;
  // Head for the person's own cell and stop at the first cell beside them, so the Intern never
  // walks past them to a "closer" cell on the far side.
  const wasBlocked = blocked.delete(key(target)); // a person may stand on a blocked cell
  const route = astar(here, target);
  if (wasBlocked) blocked.add(key(target));
  const stop = route.find((c) => near(c) && key(c) !== key(target));
  if (!stop || key(stop) === key(here)) { face(); return Promise.resolve(); }
  return new Promise((res) => {
    walkTo(stop);
    if (!path.length) { face(); res(); return; }
    arrived = () => { face(); res(); };
  });
}
/** Turn `who` to face the Intern. Returns a function that turns them back. */
export function faceIntern(who: Who): () => void {
  const a = actorMap()[who].root, me = intern.root.position;
  const before = a.rotation.y;
  a.rotation.y = Math.atan2(me.x - a.position.x, me.z - a.position.z);
  return () => { a.rotation.y = before; };
}
export function internDistance(who: Who) {
  const a = actorMap()[who].root.position, b = intern.root.position;
  return Math.hypot(a.x - b.x, a.z - b.z);
}

// ---------- Task action hooks (ticket "How Task choices play out") ----------
export type PlaceKey = 'desk' | 'printer' | 'sink' | 'toilet' | 'plant' | 'shredder' | 'shelf';
export const PLACES: Record<PlaceKey, { label: string; cell: Cell }> = {
  desk: { label: "the Intern's desk", cell: [4, 2] },
  printer: { label: 'the printer', cell: [9, 4] },
  sink: { label: 'the sink', cell: [0, 4] },
  toilet: { label: 'Room 4', cell: [1, 6] },
  plant: { label: 'the plant', cell: [9, 0] },
  shredder: { label: 'the shredder', cell: [7, 2] },
  shelf: { label: 'the evidence shelf', cell: [0, 0] },
};
const homes = new Map<Actor, { pos: THREE.Vector3; rot: number }>();
const npcs = new Map<Actor, { path: THREE.Vector3[]; done: (() => void) | null }>();
function stopNear(from: Cell, target: Cell): Cell | undefined {
  const was = blocked.delete(key(target));
  const route = astar(from, target);
  if (was) blocked.add(key(target));
  const near = (c: Cell) => Math.max(Math.abs(c[0] - target[0]), Math.abs(c[1] - target[1])) <= 1;
  return route.find((c) => near(c) && key(c) !== key(target)) ?? (route.length ? route[route.length - 1] : undefined);
}
const faceTo = (o: THREE.Object3D, x: number, z: number) => { o.rotation.y = Math.atan2(x - o.position.x, z - o.position.z); };
/** Walk the Intern to a Task's place and face it. The desk means: sit in the Intern's chair. */
export function internTo(place: PlaceKey): Promise<void> {
  const cell = PLACES[place].cell;
  return new Promise((res) => {
    if (place === 'desk') {
      const chair = chairs.find((c) => c.cell[0] === cell[0] && c.cell[1] === cell[1] + 1)!;
      if (seated && sitOn === chair) { res(); return; }
      walkTo([chair.cell[0], chair.cell[1] + 1], chair);
      if (!path.length) { res(); return; }
      arrived = res; return;
    }
    const here = cellOf(intern.root.position);
    const stop = stopNear(here, cell);
    const face = () => faceTo(intern.root, cell[0] + 0.5, cell[1] + 0.5);
    if (!stop || key(stop) === key(here)) { if (seated) { seated = false; intern.root.position.y = 0; } face(); res(); return; }
    walkTo(stop);
    if (!path.length) { face(); res(); return; }
    arrived = () => { face(); res(); };
  });
}
/** Walk a non-Intern person next to a place or a person, or back home. Resolves on arrival. */
export function npcTo(who: Who, to: PlaceKey | Who | 'home'): Promise<void> {
  const a = actorMap()[who];
  const home = homes.get(a)!;
  let goal: Cell | undefined, look: [number, number] | null = null;
  if (to === 'home') goal = cellOf(home.pos);
  else {
    const t: Cell = to in PLACES ? PLACES[to as PlaceKey].cell : cellOf(actorMap()[to as Who].root.position);
    goal = stopNear(cellOf(a.root.position), t);
    look = [t[0] + 0.5, t[1] + 0.5];
  }
  if (!goal) return Promise.resolve();
  const was = blocked.delete(key(goal));
  const cells = astar(cellOf(a.root.position), goal);
  if (was) blocked.add(key(goal));
  return new Promise((res) => {
    const finish = () => {
      if (to === 'home') { a.root.position.copy(home.pos); a.root.rotation.y = home.rot; } else if (look) faceTo(a.root, look[0], look[1]);
      play(a, /^idle$/); res();
    };
    if (cells.length < 2) { finish(); return; }
    const pts = cells.slice(1).map((c) => new THREE.Vector3(c[0] + 0.5, 0, c[1] + 0.5));
    if (to === 'home') pts[pts.length - 1] = home.pos.clone();
    npcs.set(a, { path: pts, done: finish });
  });
}
function updateNpcs(dt: number) {
  for (const [a, n] of npcs) {
    const p = a.root.position, next = n.path[0];
    const to = next.clone().sub(p); to.y = 0;
    const dist = to.length(), step = SPEED * 0.8 * dt;
    if (dist > 0.001) a.root.rotation.y = Math.atan2(to.x, to.z);
    play(a, /^walk$/);
    if (dist <= step) { p.copy(next); n.path.shift(); } else p.addScaledVector(to.normalize(), step);
    if (!n.path.length) { npcs.delete(a); n.done?.(); }
  }
}
/** Play a named clip on someone (exact Kenney Mini Characters clip name, e.g. "interact-left"). */
export function clip(who: Who, name: string) {
  const a = actorMap()[who];
  if (who === 'intern' && name !== 'sit' && seated) { seated = false; intern.root.position.y = 0; }
  play(a, new RegExp(`^${name}$`));
}
export const internSeated = () => seated;
