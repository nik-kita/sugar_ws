```ts
// version:0.1.9
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
  /**
   * @description
   * call event listener only first time
   * then remove it
   */
  once: typeof this.on = (
    ...[label, ev, options]: Parameters<typeof this.on>
  ): ReturnType<typeof this.on> => {
    const once_ev = (_ev: Event) => {
      if (typeof ev === "function") ev(_ev);
      else ev.handleEvent(_ev);
      this.removeEventListener(label, once_ev, options);
    };
    this.addEventListener(label, once_ev, options);
  };
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
  wait_for(
    state: "close",
  ): Promise<SugarWs> & { and_close: () => Promise<SugarWs> };
  wait_for(state: "open"): Promise<SugarWs>;
  wait_for(
    state: "open" | "close",
  ):
    | Promise<SugarWs>
    | (Promise<SugarWs> & { and_close: () => Promise<SugarWs> }) {
    const result = state === "open" ? this.#open() : this.#close();

    // sugar
    if (state === "close") {
      Object.assign(result, {
        and_close: () => {
          this.close();

          return result;
        },
      });
    }

    return result as
      | Promise<SugarWs>
      | (Promise<SugarWs> & { and_close: () => Promise<SugarWs> });
  }
  /**
   * @description
   * will not send data if readyState !== OPEN
   */
  send_if_open(
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ): void {
    if (this.readyState === this.OPEN) super.send(data);
  }
  /**
   * @description
   * the same as the `.addEventListener`
   */
  on = super.addEventListener;
  #open(): Promise<SugarWs> {
    return new Promise((resolve) => {
      if (this.readyState === this.OPEN) return void resolve(this);
      this.once("open", () => resolve(this));
    });
  }
  #close(): Promise<SugarWs> {
    return new Promise((resolve) => {
      if (this.readyState === this.CLOSED) return void resolve(this);
      this.addEventListener("close", () => resolve(this));
    });
  }
}
```
