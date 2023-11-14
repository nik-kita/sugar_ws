import { SugarWs } from "../mod.js";

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
 *   - `.wait_for('close').and_close()` is most often form of usage
 *   - `.wait_for('open').on_open(...)` also more often usage form
 * @experimental
 * be careful with usage
 * especially in repeated cases (open, close, open, close... etc.)
 */
export function wait_for(this: SugarWs, state: "open"): {
  on_open: (
    cb: (ev: WebSocketEventMap["open"]) => void,
  ) => Promise<SugarWs>;
} & Promise<SugarWs>;

export function wait_for(
  this: SugarWs,
  state: "close",
): { and_close: () => Promise<SugarWs> } & Promise<SugarWs>;
export function wait_for(
  this: SugarWs,
  state: "open" | "close",
):
  & Promise<SugarWs>
  & (
    | {
      on_open: (
        cb: (ev: WebSocketEventMap["open"]) => void,
      ) => Promise<SugarWs>;
    }
    | { and_close: () => Promise<SugarWs> }
  ) {
  const result = state === "open" ? this.__open() : this.__close();

  if (state === "open") {
    Object.assign(result, {
      on_open: (cb: (ev: WebSocketEventMap["open"]) => void) => {
        this.once("open", cb);

        return result;
      },
    });
  }

  if (state === "close") {
    Object.assign(result, {
      and_close: () => {
        this.close();

        return result;
      },
    });
  }

  return result as unknown as ReturnType<typeof wait_for>;
}
