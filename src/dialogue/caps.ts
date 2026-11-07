// Tracks one Colleague Conversation's totals and throws when it breaks a Conversation cap.
import type { Pressure } from "../rules/index";

export class ConversationCaps {
  private readonly totals = new Map<Pressure, number>();
  private escalations = 0;

  constructor(private readonly knot: string) {}

  adjust(pressure: Pressure, delta: number): void {
    if (delta === 0) return;
    if (pressure === "performance") this.fail("changes Performance");
    const total = (this.totals.get(pressure) ?? 0) + delta;
    this.totals.set(pressure, total);
    if (this.totals.size > 1) this.fail(`changes more than one Pressure: ${[...this.totals.keys()].join(", ")}`);
    if (Math.abs(total) > 1) this.fail(`changes ${pressure} by ${total} in total`);
  }

  escalate(): void {
    this.escalations += 1;
    if (this.escalations > 1) this.fail("calls escalate() more than once");
  }

  private fail(reason: string): never {
    throw new Error(`Conversation cap broken: knot "${this.knot}" ${reason}.`);
  }
}
