// The Biooro billboard beside the car park. Its face changes with the tier. In Wrong it turns red.
// It does not glow: only the two assets in docs/art/making-assets.md may glow.
import { CanvasTexture, Group, Mesh, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { billboardText } from "../locales/index";
import type { Tier } from "../rules/index";
import { chamferedBox, kitMaterial } from "./kit";

const WIDTH = 3.2;
const HEIGHT = 1.6;
const POST_HEIGHT = 1.8;
const BRAND_TEAL = "#1f8a8a";

const FACE: Record<Tier, { background: string; ink: string }> = {
  mundane: { background: "#f4efe6", ink: BRAND_TEAL },
  odd: { background: "#e8ecd9", ink: "#2c6b5c" },
  wrong: { background: "#8f1a14", ink: "#ffe9e2" },
};

export type Billboard = { root: Group; setTier(tier: Tier): void };

export function createBillboard(startTier: Tier): Billboard {
  const root = new Group();
  root.name = "billboard";
  const metal = kitMaterial("metalDark");
  for (const x of [-WIDTH / 3, WIDTH / 3]) {
    const post = new Mesh(chamferedBox(0.12, POST_HEIGHT, 0.12), metal);
    post.position.set(x, POST_HEIGHT / 2, 0);
    root.add(post);
  }
  const frame = new Mesh(chamferedBox(WIDTH + 0.16, HEIGHT + 0.16, 0.1), kitMaterial("metalMedium"));
  frame.position.set(0, POST_HEIGHT + HEIGHT / 2, 0);
  root.add(frame);

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = Math.round((640 * HEIGHT) / WIDTH);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const face = new Mesh(new PlaneGeometry(WIDTH, HEIGHT), new MeshStandardMaterial({ map: texture, roughness: 1 }));
  face.position.set(0, POST_HEIGHT + HEIGHT / 2, 0.051);
  root.add(face);

  root.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
    o.raycast = () => {};
  });

  const setTier = (tier: Tier) => {
    paint(canvas, billboardText[tier], FACE[tier]);
    texture.needsUpdate = true;
  };
  setTier(startTier);
  return { root, setTier };
}

function paint(canvas: HTMLCanvasElement, lines: readonly string[], colours: { background: string; ink: string }) {
  const g = canvas.getContext("2d");
  if (!g) return;
  g.fillStyle = colours.background;
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = colours.ink;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const [brand, ...rest] = lines;
  g.font = "bold 92px system-ui";
  g.fillText(brand, canvas.width / 2, canvas.height * 0.3);
  g.font = "bold 44px system-ui";
  rest.forEach((line, i) => {
    g.fillText(line, canvas.width / 2, canvas.height * 0.62 + i * 52);
  });
}
