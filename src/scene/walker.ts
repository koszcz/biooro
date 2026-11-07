// Moves a person along a list of floor points at walking speed. It has no Three.js, so tests can drive it.

/** Tiles per second. */
export const WALK_SPEED = 2.4;

export type FloorPoint = { x: number; z: number };

export class Walker {
  position: FloorPoint;
  /** Turn around the vertical axis. 0 faces +z, toward the camera. */
  heading = 0;
  private points: FloorPoint[] = [];
  private arrived: (() => void) | undefined;

  constructor(start: FloorPoint) {
    this.position = { ...start };
  }

  get walking(): boolean {
    return this.points.length > 0;
  }

  /** Starts a new walk through the points. `onArrive` runs once, on the last point. */
  walk(points: readonly FloorPoint[], onArrive?: () => void): void {
    this.points = points.map((p) => ({ ...p }));
    this.arrived = onArrive;
    if (!this.walking) this.finish();
  }

  update(seconds: number): void {
    let budget = WALK_SPEED * seconds;
    while (this.walking && budget > 0) {
      const next = this.points[0];
      const dx = next.x - this.position.x;
      const dz = next.z - this.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 1e-6) this.heading = Math.atan2(dx, dz);
      if (distance <= budget) {
        this.position = { ...next };
        this.points.shift();
        budget -= distance;
        if (!this.walking) this.finish();
      } else {
        this.position = {
          x: this.position.x + (dx / distance) * budget,
          z: this.position.z + (dz / distance) * budget,
        };
        budget = 0;
      }
    }
  }

  private finish(): void {
    const arrived = this.arrived;
    this.arrived = undefined;
    arrived?.();
  }
}
