// Builds the office scene, renders it into the page and wires the mouse wheel zoom.
import { AmbientLight, Color, DirectionalLight, Scene, Vector3, WebGLRenderer } from "three";
import { createIsoCamera, resizeCamera, zoomCamera } from "./camera";
import { createFloor, FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";

const BACKGROUND = 0xf3ece0;

export function startOfficeScene(container: HTMLElement): void {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  scene.add(createFloor());
  scene.add(new AmbientLight(0xffffff, 1.2));
  const sun = new DirectionalLight(0xffffff, 1.5);
  sun.position.set(-6, 14, 8);
  scene.add(sun);

  const centre = new Vector3((FLOOR_WIDTH - 1) / 2, 0, (FLOOR_DEPTH - 1) / 2);
  const camera = createIsoCamera(centre, container.clientWidth / container.clientHeight);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.append(renderer.domElement);

  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    resizeCamera(camera, container.clientWidth / container.clientHeight);
  });
  renderer.domElement.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomCamera(camera, event.deltaY);
    },
    { passive: false },
  );

  renderer.setAnimationLoop(() => renderer.render(scene, camera));
}
