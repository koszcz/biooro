// PROTOTYPE, throwaway. Answers the "Character and art direction" ticket.
// One floor, three rooms (Customer Complaints, Product Safety, Showroom) joined by a corridor,
// plus a cast lineup. Kenney Furniture Kit + Mini Characters only; tints and tiny primitives for cues.
// Click the floor to walk the Intern. Wheel zooms. Arrow keys pan. Panel buttons jump the camera and set Escalation.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

const W = 21, D = 11, ROOM_D = 8; // rooms z 0..7, wall row z=8, corridor z 9..10
const WALL_H = 1.3, STUB = 0.2, INNER = 0.5, T = 0.15;
const params = new URLSearchParams(location.search);

// ---------- palette ----------
const FACTION = {
  launch: { name: 'Launch Team', color: '#18b6c8', trim: '#0b6f7a' },
  paper: { name: 'Paper Trail', color: '#c9ab6b', trim: '#7a6a45' },
  none: { name: 'Intern', color: '#ff7a1a', trim: '#b34700' },
} as const;
type Fac = keyof typeof FACTION;

// ---------- three ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const hemi = new THREE.HemisphereLight('#fff6e8', '#5a5f6b', 1.4);
const sun = new THREE.DirectionalLight('#ffffff', 2);
sun.position.set(W * 0.9, 14, D * 1.3);
sun.target.position.set(W / 2, 0, D / 2);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 14, bottom: -14, far: 80 });
scene.add(hemi, sun, sun.target);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
const camTarget = new THREE.Vector3(W / 2, 0.4, D / 2);
let camGoal = { x: W / 2, z: D / 2, zoom: 1 };
let zoom = 1;
const ELEV = THREE.MathUtils.degToRad(35.264), YAW = THREE.MathUtils.degToRad(45);
function placeCamera() {
  const dir = new THREE.Vector3(Math.sin(YAW) * Math.cos(ELEV), Math.sin(ELEV), Math.cos(YAW) * Math.cos(ELEV));
  camera.position.copy(camTarget).addScaledVector(dir, 80);
  camera.lookAt(camTarget);
  const aspect = innerWidth / innerHeight;
  const halfW = 13.2 / zoom, halfH = halfW / aspect;
  Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
  camera.updateProjectionMatrix();
}

// ---------- helpers ----------
const mat = (c: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.9, ...extra });
function slab(x0: number, z0: number, w: number, d: number, h: number, y: number, c: string, extra = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, extra));
  m.position.set(x0 + w / 2, y + h / 2, z0 + d / 2);
  m.castShadow = m.receiveShadow = true;
  m.raycast = () => {};
  scene.add(m);
  return m;
}
function canvasSign(lines: string[], w: number, h: number, bg: string, fg: string, px = 64, emissive = false) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = Math.round((512 * h) / w);
  const g = c.getContext('2d')!;
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(10, 10, c.width - 20, c.height - 20);
  g.fillStyle = fg; g.font = `bold ${px}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * px * 1.15));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissive: emissive ? '#ffffff' : '#000', emissiveMap: emissive ? tex : null, emissiveIntensity: emissive ? 0.9 : 0, roughness: 1 }));
  m.raycast = () => {};
  return m;
}
function wallSign(m: THREE.Mesh, x: number, y: number, z: number, onBack = true) {
  m.position.set(x, y, z);
  if (!onBack) m.rotation.y = Math.PI / 2;
  scene.add(m);
}

// ---------- floor + rooms ----------
const floor = new THREE.Mesh(new THREE.BoxGeometry(W + 12, 0.1, D), mat('#9a9a96'));
floor.position.set((W + 12) / 2, -0.05, D / 2);
floor.receiveShadow = true; floor.userData.kind = 'floor';
scene.add(floor);
const clickables: THREE.Object3D[] = [floor];

type Room = { key: string; x0: number; x1: number; floor: string; floor2: string; wall: string; name: string };
const ROOMS: Room[] = [
  { key: 'cc', name: 'Customer Complaints', x0: 0, x1: 7, floor: '#d9c9a3', floor2: '#cebd96', wall: '#bcd4c1' },
  { key: 'ps', name: 'Product Safety', x0: 9, x1: 13, floor: '#aeb8c0', floor2: '#a3aeb7', wall: '#d9d6cc' },
  { key: 'sr', name: 'Showroom', x0: 15, x1: 20, floor: '#efeeea', floor2: '#e3e1db', wall: '#f4efe6' },
];
for (const r of ROOMS) {
  for (let x = r.x0; x <= r.x1; x++) for (let z = 0; z < ROOM_D; z++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat((x + z) % 2 ? r.floor : r.floor2, { roughness: r.key === 'sr' ? 0.35 : 0.95 }));
    m.rotation.x = -Math.PI / 2; m.position.set(x + 0.5, 0.003, z + 0.5); m.receiveShadow = true; m.raycast = () => {};
    scene.add(m);
  }
}
// corridor lino stripe
for (let x = 0; x < W; x++) for (let z = 9; z < D; z++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat((x + z) % 2 ? '#8e8f8b' : '#97988f'));
  m.rotation.x = -Math.PI / 2; m.position.set(x + 0.5, 0.003, z + 0.5); m.receiveShadow = true; m.raycast = () => {};
  scene.add(m);
}

// ---------- walls + blocking ----------
const blocked = new Set<string>();
const k = (x: number, z: number) => `${x},${z}`;
const doorsRow8 = new Set([4, 11, 17]);
const doorsCol = new Set([4]); // z of the door in the x=8 and x=14 columns
for (let x = 0; x < W; x++) if (!doorsRow8.has(x)) blocked.add(k(x, 8));
for (const cx of [8, 14]) for (let z = 0; z < ROOM_D; z++) if (!doorsCol.has(z)) blocked.add(k(cx, z));
for (const cx of [8, 14]) blocked.add(k(cx, 8));
function wallBox(x0: number, z0: number, w: number, d: number, h: number, c: string) {
  slab(x0, z0, w, d, h, 0, c);
}
// back wall (full height), west wall (full), by room colour
for (const r of ROOMS) wallBox(r.x0 - (r.key === 'cc' ? 0 : 1), -T, r.x1 - r.x0 + 1 + (r.key === 'cc' ? 0 : 1) + (r.key === 'cc' || r.key === 'ps' ? 1 : 1), T, WALL_H, r.wall);
wallBox(-T, 0, T, D, WALL_H, '#bcd4c1');
// interior walls: low stubs so rooms stay readable from the camera
for (let x = 0; x < W; x++) if (blocked.has(k(x, 8))) wallBox(x, 8.5 - T / 2, 1, T, INNER, '#cfc9bb');
for (const cx of [8, 14]) for (let z = 0; z < ROOM_D; z++) if (blocked.has(k(cx, z))) wallBox(cx + 0.5 - T / 2, z, T, 1, INNER, '#cfc9bb');
// doorway markers: dark threshold + mat
for (const x of doorsRow8) slab(x + 0.1, 8.2, 0.8, 0.6, 0.02, 0, '#5a554c');
for (const cx of [8, 14]) slab(cx + 0.2, 4.1, 0.6, 0.8, 0.02, 0, '#5a554c');
// near outer walls: stubs
wallBox(0, D, W, T, STUB, '#8e8f8b');
wallBox(W, 0, T, D, STUB, '#8e8f8b');

// ---------- assets ----------
const loader = new GLTFLoader();
const cache = new Map<string, Promise<THREE.Group>>();
const load = (path: string) => {
  if (!cache.has(path)) cache.set(path, loader.loadAsync(path).then((g: any) => { g.scene.traverse((o: any) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); g.scene.userData.anims = g.animations; return g.scene; }));
  return cache.get(path)!;
};
type PutOpts = { rot?: number; y?: number; ox?: number; oz?: number; s?: number; block?: boolean; snapN?: boolean };
// Kenney furniture origins sit at a corner, so each piece is centred on its cell, grounded, then offset.
async function put(name: string, x: number, z: number, o: PutOpts = {}) {
  const src = await load(`/kenney/furniture/${name}.glb`);
  const inner = cloneSkinned(src) as THREE.Group;
  const box = new THREE.Box3().setFromObject(inner); const c = box.getCenter(new THREE.Vector3());
  inner.position.set(-c.x, -box.min.y, -c.z);
  const pivot = new THREE.Group(); pivot.add(inner);
  pivot.position.set(x + 0.5 + (o.ox ?? 0), o.y ?? 0, z + 0.5 + (o.oz ?? 0));
  pivot.rotation.y = o.rot ?? 0;
  if (o.s) pivot.scale.setScalar(o.s);
  scene.add(pivot);
  if (o.snapN) { pivot.updateMatrixWorld(true); const wb = new THREE.Box3().setFromObject(pivot); pivot.position.z += z + 0.03 - wb.min.z; }
  if (o.block) blocked.add(k(x, z));
  return pivot;
}
const DESK_H = 0.38, SEAT_DZ = -0.42, SEAT_LIFT = 0.13; // lift seated characters so they sit tall at the desk, not under it
// desk with the user on the north side (chair faces south, toward the camera)
async function workstation(x: number, z: number, o: { lamp?: boolean; chairRot?: number } = {}) {
  await put('desk', x, z, { rot: Math.PI, block: true });
  await put('computerScreen', x, z, { rot: Math.PI, y: DESK_H, oz: 0.08 });
  await put('computerKeyboard', x, z, { rot: Math.PI, y: DESK_H, oz: -0.1 });
  await put('chairDesk', x, z, { rot: o.chairRot ?? 0, oz: SEAT_DZ });
  if (o.lamp) await put('lampSquareTable', x, z, { y: DESK_H, ox: -0.25, oz: 0.1 });
}
function rug(x0: number, z0: number, w: number, d: number, c: string) { return slab(x0, z0, w, d, 0.015, 0.003, c); }

// ---------- Customer Complaints (beige carpet, mint walls, tired fluorescent) ----------
async function buildComplaints() {
  rug(1.2, 1.1, 6.6, 4.9, '#a7c8c6'); // faint teal: Launch Team turf
  for (const x of [2, 3, 4, 5, 6]) await workstation(x, 2);                 // front row, Intern at 2
  for (const x of [3, 4, 5]) await workstation(x, 5, { chairRot: 0 });      // back row, empty seats
  await put('deskCorner', 1, 5, { rot: Math.PI, block: true });             // Pogodny
  await put('computerScreen', 1, 5, { y: DESK_H, rot: Math.PI, oz: 0.15, ox: 0.1 });
  await put('chairDesk', 1, 5, { rot: 0, oz: -0.5 });
  await put('bookcaseClosedWide', 4, 0, { block: true, snapN: true });
  await put('bookcaseClosed', 2, 0, { block: true, snapN: true });
  await put('bookcaseClosed', 6, 0, { block: true, snapN: true });
  await put('pottedPlant', 7, 0, { block: true });
  await put('trashcan', 0, 7, { block: true });
  await put('coatRackStanding', 7, 4, { block: true });
  // complaint boxes stacked in the corner: the Launch Team's "buried" pile
  await put('cardboardBoxClosed', 6, 7, { block: true });
  await put('cardboardBoxClosed', 6, 7, { y: 0.28, rot: 0.4 });
  await put('cardboardBoxClosed', 7, 7, { block: true, rot: 0.2 });
  const s = canvasSign(['LAUNCH', 'TEAM'], 1.5, 0.9, FACTION.launch.color, '#ffffff', 90);
  wallSign(s, 5.0, 0.95, 0.01);
  const s2 = canvasSign(['WE LOVE', 'FEEDBACK'], 1.3, 0.8, '#f3e6a5', '#7a5b00', 70);
  wallSign(s2, 1.7, 0.95, 0.01);
}
// ---------- Product Safety (cold grey-blue, paper everywhere, one lamp) ----------
async function buildSafety() {
  rug(9.2, 1.1, 4.6, 4.9, '#c9ab6b'); // manila: Paper Trail turf
  for (const x of [9, 10, 11, 12, 13]) await put('bookcaseClosed', x, 0, { block: true, snapN: true });
  await workstation(10, 2, { lamp: true });                                   // Teczka
  await workstation(12, 2, { lamp: true, chairRot: 0.6 });                    // Przeciek's desk, nobody home
  await put('books', 12, 2, { y: DESK_H, ox: 0.2, rot: 0.3 });
  await put('books', 12, 2, { y: DESK_H + 0.1, ox: 0.2, oz: 0.05, rot: 0.9 });
  await put('cardboardBoxClosed', 13, 6, { block: true });
  await put('cardboardBoxClosed', 13, 6, { y: 0.28, rot: 0.2 });
  await put('cardboardBoxClosed', 13, 7, { block: true });
  await put('cardboardBoxClosed', 9, 7, { block: true });
  await put('bookcaseOpenLow', 11, 6, { block: true, rot: Math.PI });
  const s = canvasSign(['NOTICE', 'IT IS ALL', 'IN WRITING'], 1.6, 1.0, '#fff7d6', '#7a1f1f', 60);
  wallSign(s, 11.5, 1.05, 0.01); s.scale.setScalar(0.8);
}
// ---------- Showroom (white, glossy, warm spotlights, Smart range at centre) ----------
let smartLed: THREE.Mesh, smartLight: THREE.PointLight;
async function buildShowroom() {
  const podium = (x: number, z: number) => slab(x + 0.05, z + 0.05, 0.9, 0.9, 0.1, 0, '#ffffff', { roughness: 0.3 });
  const items: [string, number, number][] = [['toilet', 16, 1], ['toiletSquare', 18, 1], ['toilet', 20, 1]];
  for (const [n, x, z] of items) { podium(x, z); await put(n, x, z, { y: 0.1, block: true }); }
  podium(16, 5); await put('bathroomSink', 16, 5, { y: 0.1, block: true });
  podium(18, 5); await put('shower', 18, 5, { y: 0.1, block: true });
  podium(20, 5); await put('bathroomCabinet', 20, 5, { y: 0.1, block: true });
  await put('pottedPlant', 15, 0, { block: true });
  await put('pottedPlant', 20, 7, { block: true });
  rug(15.4, 6.0, 5.2, 1.2, '#18b6c8'); // runner in brand teal
  // the Smart toilet: slightly too attentive
  smartLed = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({ color: '#ff2020', emissive: '#ff1010', emissiveIntensity: 2 }));
  smartLed.position.set(18.5, 0.55, 1.78);
  scene.add(smartLed);
  smartLight = new THREE.PointLight('#ff2a1a', 0, 3, 2);
  smartLight.position.set(18.5, 0.7, 2.2);
  scene.add(smartLight);
  const s = canvasSign(['SMART', 'RANGE'], 1.8, 0.9, '#10202a', '#7ef0ff', 100, true);
  wallSign(s, 18.0, 0.95, 0.01);
  const s2 = canvasSign(['It listens', 'so you don’t have to'], 1.5, 0.7, '#f4efe6', '#10202a', 40);
  wallSign(s2, 16.0, 0.95, 0.01); s2.scale.setScalar(0.9);
}
// ---------- Corridor + stairwell ----------
async function buildCorridor() {
  await put('stairsOpen', 0, 9, { block: true, rot: Math.PI / 2 });
  await put('bench', 2, 10, { block: true, rot: 0 });
  await put('pottedPlant', 20, 9, { block: true });
  await put('coatRack', 13, 9, { block: true });
  await put('rugDoormat', 4, 9, {});
  await put('rugDoormat', 11, 9, {});
  await put('rugDoormat', 17, 9, {});
  for (const [x, label, c] of [[4, 'Customer Complaints', '#bcd4c1'], [11, 'Product Safety', '#d9d6cc'], [17, 'Showroom', '#f4efe6']] as const) {
    const s = canvasSign([label], 1.4, 0.3, c, '#222', 46);
    s.scale.setScalar(0.8); s.position.set(x + 0.5, 0.55, 8.62); s.rotation.y = 0; scene.add(s);
    s.position.y = 0.58;
  }
}

// ---------- characters ----------
type Actor = { id: string; root: THREE.Group; model: THREE.Group; mixer: THREE.AnimationMixer; clips: THREE.AnimationClip[]; cur?: THREE.AnimationAction; fac: Fac; role: string; tagEl: HTMLDivElement };
const actors: Actor[] = [];
let charSize = Number(params.get('cs') ?? 1);
const tagsEl = document.getElementById('tags')!;
function play(a: Actor, re: RegExp) {
  const c = a.clips.find((x) => re.test(x.name)); if (!c) return;
  const n = a.mixer.clipAction(c); if (a.cur === n) return;
  n.reset().fadeIn(0.2).play(); a.cur?.fadeOut(0.2); a.cur = n;
}
const ACC_PATH = (n: string) => `/kenney/characters/${n}.glb`;
type Spec = { dx?: number; dz?: number; id: string; file: string; fac: Fac; role: string; x: number; z: number; face: number; clip: RegExp; tint?: string; scale?: number; extras?: (a: Actor) => Promise<void> | void; at?: THREE.Vector3 };
function bone(a: Actor, name: string) { let b: THREE.Object3D | undefined; a.model.traverse((o) => { if (o.name === name) b = o; }); return b!; }
function addPart(parent: THREE.Object3D, geo: THREE.BufferGeometry, color: string, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], extra = {}) {
  const m = new THREE.Mesh(geo, mat(color, extra)); m.position.set(...pos); m.rotation.set(...rot); m.castShadow = true; parent.add(m); return m;
}
// lanyard + badge; hangs on the chest. torso bone is at the hip so offsets are in torso-local space.
function lanyard(a: Actor, color: string, badge: string) {
  const t = bone(a, 'torso');
  addPart(t, new THREE.BoxGeometry(0.03, 0.14, 0.01), color, [0, 0.2, 0.115]);
  addPart(t, new THREE.BoxGeometry(0.09, 0.1, 0.012), badge, [0, 0.11, 0.12]);
}
function folder(a: Actor, color: string) {
  const arm = bone(a, 'arm-right');
  addPart(arm, new THREE.BoxGeometry(0.14, 0.02, 0.2), color, [-0.03, -0.12, 0.1]);
  addPart(arm, new THREE.BoxGeometry(0.1, 0.022, 0.08), '#c23b3b', [-0.03, -0.12, 0.03]);
}
async function glasses(a: Actor, which = 'aid-glasses', y = 0.0, z = 0.05) {
  const g = cloneSkinned(await load(ACC_PATH(which))) as THREE.Group;
  const h = bone(a, 'head');
  g.position.set(0, y, z); g.scale.setScalar(1);
  h.add(g);
}
// uniform vest over the torso: the loudest faction cue, readable at whole-floor zoom
function vest(a: Actor, color: string, stripe?: string) {
  const t = bone(a, 'torso');
  addPart(t, new THREE.BoxGeometry(0.3, 0.19, 0.32), color, [0, 0.09, -0.02]);
  if (stripe) addPart(t, new THREE.BoxGeometry(0.31, 0.03, 0.33), stripe, [0, 0.07, -0.02]);
}
function necktie(a: Actor, color: string) {
  const t = bone(a, 'torso');
  addPart(t, new THREE.BoxGeometry(0.05, 0.16, 0.014), color, [0, 0.14, 0.12]);
}
function recorder(a: Actor) { // Teczka's red "recording" light
  const t = bone(a, 'torso');
  const led = addPart(t, new THREE.SphereGeometry(0.025, 8, 6), '#ff2020', [0.07, 0.2, 0.125], [0, 0, 0], { emissive: '#ff0000', emissiveIntensity: 2 });
  (led as any).userData.blink = true; blinkers.push(led);
}
const blinkers: THREE.Mesh[] = [];

async function makeActor(sp: Spec) {
  const src = await load(`/kenney/characters/${sp.file}.glb`);
  const model = cloneSkinned(src) as THREE.Group;
  const root = new THREE.Group(); root.add(model);
  root.position.set(sp.x + 0.5 + (sp.dx ?? 0), /sit/.test(sp.clip.source) ? SEAT_LIFT : 0, sp.z + 0.5 + (sp.dz ?? 0)); root.rotation.y = sp.face;
  root.userData.base = sp.scale ?? 1; root.scale.setScalar(root.userData.base * charSize);
  if (sp.tint) model.traverse((o: any) => { if (o.isMesh && o.name === 'body-mesh') { o.material = o.material.clone(); o.material.color = new THREE.Color(sp.tint); } });
  const tagEl = document.createElement('div'); tagEl.className = 'tag';
  tagEl.innerHTML = `<i style="background:${FACTION[sp.fac].color}"></i>${sp.id}<small>${sp.role}</small>`;
  tagsEl.appendChild(tagEl);
  const a: Actor = { id: sp.id, root, model, mixer: new THREE.AnimationMixer(model), clips: src.userData.anims, fac: sp.fac, role: sp.role, tagEl };
  scene.add(root); actors.push(a);
  await sp.extras?.(a);
  play(a, sp.clip);
  return a;
}
const SEAT = 0; // sit clip needs no offset (see Isometric office look ticket)
const specs: Spec[] = [
  // ---- the Intern: only fully saturated hi-vis orange on the floor, plus a ring and a marker
  { id: 'Intern', file: 'character-male-c', fac: 'none', role: 'you', x: 6, z: 4, face: 0, clip: /idle/, extras: (a) => { vest(a, '#ff7a1a', '#ffffff'); } },
  // ---- Launch Team (teal lanyards, teal tint, coffee/phone energy)
  { id: 'Pan Zbigniew Pogodny', file: 'character-male-d', fac: 'launch', role: 'Boss', x: 1, z: 5, dz: -0.5, face: 0, clip: /sit/, scale: 1.12, extras: (a) => { vest(a, FACTION.launch.color); lanyard(a, '#ffffff', FACTION.launch.trim); necktie(a, '#0b3d44'); } },
  { id: 'Ryszard Szablon', file: 'character-male-a', fac: 'launch', role: 'Colleague', x: 4, z: 2, dz: SEAT_DZ, face: 0, clip: /sit/, extras: (a) => { vest(a, FACTION.launch.color); lanyard(a, '#ffffff', FACTION.launch.trim); } },
  { id: 'Wiola Ufna', file: 'character-female-b', fac: 'launch', role: 'Colleague', x: 17, z: 3, face: 0, clip: /emote-yes/, extras: (a) => { vest(a, FACTION.launch.color); lanyard(a, '#ffffff', FACTION.launch.trim); } },
  // ---- Paper Trail (manila, khaki tint, folders, reading glasses)
  { id: 'Pani Halina Teczka', file: 'character-female-e', fac: 'paper', role: 'Boss', x: 10, z: 2, dz: SEAT_DZ, face: 0, clip: /sit/, scale: 1.12, extras: async (a) => { vest(a, FACTION.paper.color); await glasses(a); folder(a, '#e2c67e'); recorder(a); } },
  { id: 'Kamil Przeciek', file: 'character-male-f', fac: 'paper', role: 'Colleague', x: 2, z: 10, face: 0, clip: /sit/, extras: async (a) => { vest(a, FACTION.paper.color); await glasses(a, 'aid-sunglasses'); folder(a, '#e2c67e'); } },
];

// ---------- cast lineup (off to the east of the floor) ----------
const LINE_X = 24.5;
async function buildLineup() {
  slab(LINE_X - 1, 2, 8.5, 5, 0.1, -0.08, '#3a3f49'); // stage (raycast disabled)
  const order = ['Intern', 'Pan Zbigniew Pogodny', 'Ryszard Szablon', 'Wiola Ufna', 'Pani Halina Teczka', 'Kamil Przeciek'];
  const proto = new Map(specs.map((s) => [s.id, s]));
  let i = 0;
  for (const id of order) {
    const sp = proto.get(id)!;
    const copy: Spec = { ...sp, x: LINE_X + i * 1.3 - 0.5, z: 4, face: Math.PI / 4, clip: /idle/ };
    const a = await makeActor(copy);
    lineup.push(a); i++;
  }
}
const lineup: Actor[] = [];

// ---------- Intern highlight ----------
let ring: THREE.Mesh, arrow: THREE.Mesh;
function internHighlight(a: Actor) {
  ring = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.38, 28), new THREE.MeshBasicMaterial({ color: '#ff7a1a', side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.012; a.root.add(ring);
  arrow = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), new THREE.MeshBasicMaterial({ color: '#ff7a1a' }));
  arrow.rotation.x = Math.PI; arrow.position.y = 1.1; a.root.add(arrow);
}

// ---------- A* and walking ----------
type Cell = [number, number];
function astar(start: Cell, goal: Cell): Cell[] {
  const key = (c: Cell) => c.join(',');
  const open = new Map<string, { c: Cell; g: number; f: number }>(); const came = new Map<string, string>(); const gs = new Map([[key(start), 0]]);
  const h = (c: Cell) => Math.hypot(c[0] - goal[0], c[1] - goal[1]);
  open.set(key(start), { c: start, g: 0, f: h(start) });
  while (open.size) {
    let bk = '', b: any; for (const [kk, n] of open) if (!b || n.f < b.f) { b = n; bk = kk; }
    open.delete(bk);
    if (bk === key(goal)) { const p: Cell[] = [b.c]; let kk = bk; while (came.has(kk)) { kk = came.get(kk)!; p.unshift(kk.split(',').map(Number) as Cell); } return p; }
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const n: Cell = [b.c[0] + dx, b.c[1] + dz];
      if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= D || blocked.has(key(n))) continue;
      if (dx && dz && (blocked.has(k(b.c[0] + dx, b.c[1])) || blocked.has(k(b.c[0], b.c[1] + dz)))) continue;
      const g = b.g + (dx && dz ? Math.SQRT2 : 1);
      if (g < (gs.get(key(n)) ?? Infinity)) { gs.set(key(n), g); came.set(key(n), bk); open.set(key(n), { c: n, g, f: g + h(n) }); }
    }
  }
  return [];
}
let intern: Actor; let path: THREE.Vector3[] = [];
function updateIntern(dt: number) {
  if (!path.length) return;
  const p = intern.root.position; const next = path[0];
  const to = next.clone().sub(p); to.y = 0; const dist = to.length(); const step = 2.4 * dt;
  if (dist > 0.001) intern.root.rotation.y = Math.atan2(to.x, to.z);
  play(intern, /walk/);
  if (dist <= step) { p.copy(next); path.shift(); } else p.addScaledVector(to.normalize(), step);
  if (!path.length) play(intern, /idle/);
}
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (e) => {
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(clickables, true)[0]; if (!hit) return;
  const c: Cell = [Math.floor(hit.point.x), Math.floor(hit.point.z)];
  if (blocked.has(k(c[0], c[1]))) return;
  const cells = astar([Math.floor(intern.root.position.x), Math.floor(intern.root.position.z)], c);
  path = cells.slice(1).map((q) => new THREE.Vector3(q[0] + 0.5, 0, q[1] + 0.5));
});

// ---------- Escalation lighting ----------
type Look = { hemiSky: string; hemiGround: string; hemiI: number; sun: string; sunI: number; bg: string; led: number; flicker: number };
const LOOKS: Look[] = [
  { hemiSky: '#fff4e0', hemiGround: '#8a8478', hemiI: 1.5, sun: '#fff6e6', sunI: 2.0, bg: '#2b3038', led: 0.0, flicker: 0 },     // Mon: bright, boring
  { hemiSky: '#eef3e2', hemiGround: '#767c6c', hemiI: 1.35, sun: '#f2f4e2', sunI: 1.85, bg: '#262c28', led: 0.5, flicker: 0 },   // Wed: slightly tired
  { hemiSky: '#e0eed6', hemiGround: '#5c665a', hemiI: 1.15, sun: '#e8f2d6', sunI: 1.6, bg: '#1b2620', led: 1.6, flicker: 0 },   // Fri: greyer, the LED has opinions
];
let tier = Number(params.get('tier') ?? 0);
const cur = { hemiI: 1.5, sunI: 2, led: 0, flicker: 0 };
const cs = { sky: new THREE.Color(LOOKS[0].hemiSky), gr: new THREE.Color(LOOKS[0].hemiGround), sun: new THREE.Color(LOOKS[0].sun), bg: new THREE.Color(LOOKS[0].bg) };
function stepLook(dt: number, t: number) {
  const L = LOOKS[tier]; const a = Math.min(1, dt * 2.5);
  cs.sky.lerp(new THREE.Color(L.hemiSky), a); cs.gr.lerp(new THREE.Color(L.hemiGround), a);
  cs.sun.lerp(new THREE.Color(L.sun), a); cs.bg.lerp(new THREE.Color(L.bg), a);
  cur.hemiI += (L.hemiI - cur.hemiI) * a; cur.sunI += (L.sunI - cur.sunI) * a; cur.led += (L.led - cur.led) * a; cur.flicker += (L.flicker - cur.flicker) * a;
  const fl = 1; // steady: no flicker (it read as a bug)
  hemi.color.copy(cs.sky); hemi.groundColor.copy(cs.gr); hemi.intensity = cur.hemiI * fl;
  sun.color.copy(cs.sun); sun.intensity = cur.sunI * fl; scene.background = cs.bg;
  if (smartLight) { smartLight.intensity = cur.led * (0.7 + 0.3 * Math.sin(t * 2.2)); (smartLed.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + cur.led * (0.7 + 0.3 * Math.sin(t * 2.2)); }
}

// ---------- UI ----------
const panel = document.getElementById('panel')!;
const legend = document.getElementById('legend')!;
let showTags = params.get('tags') !== '0';
let viewName = params.get('view') ?? 'floor';
const VIEWS: Record<string, { x: number; z: number; zoom: number; label: string }> = {
  floor: { x: W / 2, z: D / 2, zoom: 1, label: 'Whole floor' },
  cc: { x: 4, z: 4, zoom: 2.4, label: 'Complaints' },
  ps: { x: 11.5, z: 4, zoom: 2.9, label: 'Safety' },
  sr: { x: 17.5, z: 4, zoom: 2.6, label: 'Showroom' },
  cast: { x: 26, z: 4.2, zoom: 2.6, label: 'Cast lineup' },
};
function setView(v: string) { viewName = v; const w = VIEWS[v]; camGoal = { x: w.x, z: w.z, zoom: w.zoom }; renderPanel(); }
function renderPanel() {
  panel.innerHTML = `<h1>PROTOTYPE · Character &amp; art direction</h1>
    <h2>Camera</h2>${Object.entries(VIEWS).map(([k2, v]) => `<button data-v="${k2}" class="${viewName === k2 ? 'on' : ''}">${v.label}</button>`).join('')}
    <h2>Escalation (lighting + palette)</h2>
    ${['Mon · calm', 'Wed · off', 'Fri · audit'].map((l, i) => `<button data-t="${i}" class="${tier === i ? 'on' : ''}">${l}</button>`).join('')}
    <h2>Character size</h2>${[1, 1.4].map((c) => `<button data-c="${c}" class="${charSize === c ? 'on' : ''}">×${c}</button>`).join('')}
    <h2>Labels</h2><label><input type="checkbox" id="tg" ${showTags ? 'checked' : ''}> name tags</label>
    <div style="margin-top:6px;color:#666">Click floor to walk the Intern. Wheel zoom. Arrows pan.</div>`;
  panel.querySelectorAll<HTMLButtonElement>('button[data-v]').forEach((b) => (b.onclick = () => setView(b.dataset.v!)));
  panel.querySelectorAll<HTMLButtonElement>('button[data-t]').forEach((b) => (b.onclick = () => { tier = Number(b.dataset.t); renderPanel(); }));
  panel.querySelectorAll<HTMLButtonElement>('button[data-c]').forEach((b) => (b.onclick = () => { charSize = Number(b.dataset.c); for (const a of actors) a.root.scale.setScalar(a.root.userData.base * charSize); renderPanel(); }));
  (panel.querySelector('#tg') as HTMLInputElement).onchange = (e) => { showTags = (e.target as HTMLInputElement).checked; };
}
legend.innerHTML = `<b>Reading the cast</b><br>
  <span class="sw" style="background:${FACTION.none.color}"></span>Intern: the only saturated orange, ring and marker<br>
  <span class="sw" style="background:${FACTION.launch.color}"></span>Launch Team: teal vest, white lanyard (Boss adds a tie)<br>
  <span class="sw" style="background:${FACTION.paper.color}"></span>Paper Trail: manila vest, folder, glasses (Boss adds a red record light)`;
addEventListener('wheel', (e) => { camGoal.zoom = THREE.MathUtils.clamp(camGoal.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.5, 4); });
addEventListener('keydown', (e) => {
  const s = 0.6 / zoom; const dx = (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0), dz = (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0);
  if (dx || dz) { camGoal.x += (dx + dz) * s * 0.7; camGoal.z += (dz - dx) * s * 0.7; }
});
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); placeCamera(); });

// ---------- boot ----------
async function boot() {
  await Promise.all([buildComplaints(), buildSafety(), buildShowroom(), buildCorridor()]);
  for (const sp of specs) {
    const a = await makeActor(sp);
    if (sp.id === 'Intern') { intern = a; internHighlight(a); }
  }
  await buildLineup();
  // lineup copy of the Intern: also highlight
  const li = lineup[0]; const r2 = ring.clone(); li.root.add(r2); const a2 = arrow.clone(); li.root.add(a2);
  setView(viewName); renderPanel();
  const clock = new THREE.Clock(); let t = 0;
  const v = new THREE.Vector3();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05); t += dt;
    updateIntern(dt); stepLook(dt, t);
    zoom += (camGoal.zoom - zoom) * Math.min(1, dt * 6);
    camTarget.x += (camGoal.x - camTarget.x) * Math.min(1, dt * 6);
    camTarget.z += (camGoal.z - camTarget.z) * Math.min(1, dt * 6);
    placeCamera();
    arrow.position.y = 1.1 + Math.sin(t * 4) * 0.05;
    for (const b of blinkers) (b.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(t * 6) > 0 ? 2.5 : 0.2;
    for (const a of [...actors]) {
      a.mixer.update(dt);
      v.copy(a.root.position); v.y += 1.0; v.project(camera);
      a.tagEl.style.display = showTags ? 'block' : 'none';
      a.tagEl.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; a.tagEl.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
    }
    renderer.render(scene, camera);
  });
}
boot();
(window as any).__scene = { scene, camera, actors };
