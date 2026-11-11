// Drains colour from the world outside as the tier worsens. The tier look eases `amount` from 0 (full colour) to 1 (grey).
// Each outside material gets its own copy with a small shader step, so the office's shared kit materials stay untouched.
import { type Material, Mesh, type Object3D } from "three";

export type OutsideGrey = {
  /** How grey the outside is, from 0 to 1. The tier look sets it each frame. */
  amount: { value: number };
  /** Gives every mesh under `root` a copy of its material that follows `amount`. */
  apply(root: Object3D): void;
};

const GREY_STEP = `
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114))), uOutsideGrey);
  #include <dithering_fragment>`;

export function createOutsideGrey(): OutsideGrey {
  const amount = { value: 0 };
  const copies = new Map<Material, Material>();

  const greyCopy = (material: Material): Material => {
    let copy = copies.get(material);
    if (!copy) {
      copy = material.clone();
      copy.onBeforeCompile = (shader) => {
        shader.uniforms.uOutsideGrey = amount;
        shader.fragmentShader = `uniform float uOutsideGrey;\n${shader.fragmentShader.replace(
          "#include <dithering_fragment>",
          GREY_STEP,
        )}`;
      };
      copy.customProgramCacheKey = () => "outsideGrey";
      copies.set(material, copy);
    }
    return copy;
  };

  return {
    amount,
    apply(root) {
      root.traverse((o) => {
        if (o instanceof Mesh) o.material = Array.isArray(o.material) ? o.material.map(greyCopy) : greyCopy(o.material);
      });
    },
  };
}
