import { SugarWs } from "../mod.ts";

/**
 * @description
 * promise that will
 * resolved only when readyState changes to  OPEN || CLOSE
 * (for syntax sugar return the same, this instance)
 * @important
 * `.wait_for('close')` will not close! only waiting when it happen
 * P.S.
 * the same with `.wait_for('open')` but it is not so often case
 * @tip
 * syntax sugar:
 * `.wait_for('close').and_close()` is most often form of usage
 * @experimental
 * be careful with usage
 * especially in repeated cases (open, close, open, close... etc.)
 */
export function wait_for(
  this: SugarWs,
  state: "open" | "close",
): Promise<SugarWs> & { and_close: () => Promise<SugarWs> } {
  {
    const result = state === "open" ? this.__open() : this.__close();

    // sugar
    if (state === "close") {
      Object.assign(result, {
        and_close: () => {
          this.close();

          return result;
        },
      });
    }

    return result as (Promise<SugarWs> & { and_close: () => Promise<SugarWs> });
  }
}
