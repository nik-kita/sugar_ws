import { once } from "./method-functions/once.method.js";
import { wait_for } from "./method-functions/wait_for.method.js";
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
export declare class SugarWs extends WebSocket {
    static sugarize(websocket: WebSocket): SugarWs;
    constructor(...args: ConstructorParameters<typeof WebSocket>);
    /**
     * @description
     * call event listener only first time
     * then remove it
     * @returns
     * cb that will remove this listener if it is not already called
     */
    once: typeof once;
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
    wait_for: typeof wait_for;
    /**
     * @description
     * will not send data if readyState !== OPEN
     */
    send_if_open: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => boolean;
    /**
     * @description
     * the same as the `.addEventListener`
     */
    on: WebSocket["addEventListener"];
    __open: () => Promise<SugarWs>;
    __close: () => Promise<SugarWs>;
}
