import { SugarWs } from "../mod.js";

export function __open(this: SugarWs): Promise<SugarWs> {
  return new Promise((resolve) => {
    if (this.readyState === this.OPEN) return void resolve(this);
    this.once("open", () => resolve(this));
  });
}
