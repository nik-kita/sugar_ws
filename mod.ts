import { __close } from "./method-functions/__close.method.ts";
import { __open } from "./method-functions/__open.method.ts";
import { on } from "./method-functions/on.method.ts";
import { once } from "./method-functions/once.method.ts";
import { send_if_open } from "./method-functions/send_if_open.method.ts";
import { wait_for } from "./method-functions/wait_for.method.ts";

/**
 * @description
 * it is actually origin WebSocket
 * but with some handy improvements:
 * * `.once()` listener will auto-removed after first call
 * * `.wait_for(state: 'open' | 'close')` promisify the moment when ws is really open or close
 *   * `.wait_for('close').and_close()` sugar for getting promise that is wait on close event, and make this close at once
 * * `.send_if_open()` the same as origin `.send()` but with possibility to check ws's state to prevent error when data is try to be sending on not-open ws
 * * `.on()` the same as .addEventListener... syntax sugar only
 */
export class SugarWs extends WebSocket {
  static sugarize(websocket: WebSocket): SugarWs {
    const _websocket = websocket as SugarWs;
    _websocket.__open = __open.bind(_websocket);
    _websocket.__close = __close.bind(_websocket);
    _websocket.addEventListener;
    _websocket.on = on.bind(_websocket);
    _websocket.once = once.bind(_websocket);
    // deno-lint-ignore no-explicit-any
    _websocket.wait_for = wait_for.bind(_websocket) as any;
    _websocket.send_if_open = send_if_open.bind(_websocket);

    return _websocket;
  }

  constructor(...args: ConstructorParameters<typeof WebSocket>) {
    super(...args);

    this.__open = __open.bind(this);
    this.__close = __close.bind(this);
    this.on = on.bind(this);
    this.once = once.bind(this);
    // deno-lint-ignore no-explicit-any
    this.wait_for = wait_for.bind(this) as any;
    this.send_if_open = send_if_open.bind(this);
  }
  /**
   * @description
   * call event listener only first time
   * then remove it
   * @returns
   * cb that will remove this listener if it is not already called
   */
  declare once: typeof once;
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
  declare wait_for: typeof wait_for;
  /**
   * @description
   * will not send data if readyState !== OPEN
   */
  declare send_if_open: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) => boolean;
  /**
   * @description
   * the same as the `.addEventListener`
   */
  declare on: WebSocket["addEventListener"];
  declare __open: () => Promise<SugarWs>;
  declare __close: () => Promise<SugarWs>;

  async [Symbol.asyncDispose]() {
    if (this.readyState === WebSocket.CLOSING) {
      await this.wait_for("close");
    }

    if (this.readyState === WebSocket.CLOSED) return;

    if (this.readyState === WebSocket.CONNECTING) {
      await this.wait_for("open");
    }

    await this.wait_for("close").and_close();
  }
  [Symbol.dispose] = () => {
    if (
      [WebSocket.CLOSED, WebSocket.CLOSING].includes(this.readyState as 3 | 2)
    ) return;
    this.close();
  };
}
