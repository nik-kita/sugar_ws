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
export declare function wait_for(this: SugarWs, state: "open"): EventListenerAdder & Promise<SugarWs>;
export declare function wait_for(this: SugarWs, state: "close"): {
    and_close: () => Promise<SugarWs>;
} & Promise<SugarWs>;
type EventListenerAdder = {
    and_add_listeners_for: (event_dictionary: Partial<{
        open: (ev: WebSocketEventMap["open"]) => void;
        close: (ev: WebSocketEventMap["close"]) => void;
        error: (ev: WebSocketEventMap["error"]) => void;
        message: (ev: WebSocketEventMap["message"]) => void;
        first_message: (ev: WebSocketEventMap["message"]) => void;
    }>) => Promise<SugarWs>;
};
export {};
