import { SugarWs } from "../mod.ts";

export function __close(this: SugarWs): Promise<SugarWs> {
  return new Promise((resolve) => {
    if (this.readyState === this.CLOSED) return void resolve(this);
    this.addEventListener("close", () => resolve(this));
  });
}
