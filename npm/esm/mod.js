var _a;
import { __close } from "./method-functions/__close.method.js";
import { __open } from "./method-functions/__open.method.js";
import { on } from "./method-functions/on.method.js";
import { once } from "./method-functions/once.method.js";
import { send_if_open } from "./method-functions/send_if_open.method.js";
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
export class SugarWs extends WebSocket {
    static sugarize(websocket) {
        const _websocket = websocket;
        _websocket.__open = __open.bind(_websocket);
        _websocket.__close = __close.bind(_websocket);
        _websocket.addEventListener;
        _websocket.on = on.bind(_websocket);
        _websocket.once = once.bind(_websocket);
        // deno-lint-ignore no-explicit-any
        _websocket.wait_for = wait_for.bind(_websocket);
        _websocket.send_if_open = send_if_open.bind(_websocket);
        return _websocket;
    }
    constructor(...args) {
        super(...args);
        Object.defineProperty(this, _a, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if ([WebSocket.CLOSED, WebSocket.CLOSING].includes(this.readyState))
                    return;
                this.close();
            }
        });
        this.__open = __open.bind(this);
        this.__close = __close.bind(this);
        this.on = on.bind(this);
        this.once = once.bind(this);
        // deno-lint-ignore no-explicit-any
        this.wait_for = wait_for.bind(this);
        this.send_if_open = send_if_open.bind(this);
    }
    async [Symbol.asyncDispose]() {
        if (this.readyState === WebSocket.CLOSING) {
            await this.wait_for("close");
        }
        if (this.readyState === WebSocket.CLOSED)
            return;
        if (this.readyState === WebSocket.CONNECTING) {
            await this.wait_for("open");
        }
        await this.wait_for("close").and_close();
    }
}
_a = Symbol.dispose;
