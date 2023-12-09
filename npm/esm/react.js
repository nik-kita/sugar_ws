import { SugarWs } from "./mod.js";
const { CLOSING, CLOSED, } = WebSocket;
export function genUseWs({ useEffect, useRef, useState, }) {
    return function useWs(url) {
        const x = useRef({
            ws: null,
            listeners: new Map(),
        });
        const [on_or_off, set_or_on_off,] = useState("off");
        const [is_online, set_is_online,] = useState(false);
        const [check_needed, make_check,] = useState(true);
        useEffect(() => {
            const { ws } = x.current;
            if (on_or_off === "on") {
                if (!ws ||
                    (ws && (ws.readyState === CLOSING || ws.readyState === CLOSED))) {
                    const prev = x.current.ws;
                    x.current.ws = new SugarWs(http_to_ws(url));
                    x.current.ws.wait_for("open").then(() => set_is_online(true));
                    x.current.listeners.forEach((l) => {
                        const { label, listener, on_or_once, options, } = l;
                        const rm_once_or_void = x.current.ws[on_or_once](label, listener, options);
                        if (on_or_once === "once") {
                            l.rm_once = rm_once_or_void;
                        }
                    });
                    x.current.ws.once("close", () => {
                        set_is_online(false);
                        x.current.ws = null;
                        make_check((prev) => !prev);
                    });
                    prev?.close();
                }
            }
            else {
                if (ws && (ws.readyState !== CLOSING || ws.readyState !== CLOSED)) {
                    ws.close();
                }
            }
            return () => {
                if (ws && (ws.readyState !== CLOSING || ws.readyState !== CLOSED)) {
                    ws.close();
                }
            };
        }, [on_or_off, check_needed]);
        return {
            is_online,
            turn: set_or_on_off,
            send(message) {
                if (x.current.ws) {
                    x.current.ws.send_if_open(message);
                }
            },
            on(...[label, listener, options]) {
                const key = `on::${label}::${listener.toString()}`;
                if (x.current.listeners.has(key))
                    return key;
                x.current.listeners.set(key, {
                    label,
                    listener,
                    on_or_once: "on",
                    options,
                });
                if (x.current.ws) {
                    x.current.ws.on(label, listener, options);
                }
                return key;
            },
            once(...[label, listener, options]) {
                const key = `once::${label}::${listener.toString()}`;
                if (x.current.listeners.has(key))
                    return key;
                if (x.current.ws) {
                    x.current.ws.once(label, listener, options);
                }
                x.current.listeners.set(key, {
                    label,
                    listener,
                    on_or_once: "once",
                    options,
                });
                return key;
            },
            rm(key) {
                const rm_target = x.current.listeners.get(key);
                if (!rm_target)
                    return false;
                x.current.listeners.delete(key);
                if (x.current.ws) {
                    if (rm_target.rm_once) {
                        rm_target.rm_once();
                    }
                    else {
                        x.current.ws.removeEventListener(rm_target.label, rm_target.listener);
                    }
                }
                return true;
            },
        };
    };
}
const http_to_ws = (url) => {
    if (url.substring(0, 2) === "ws")
        return url;
    const parts = url.split("http");
    if (parts.length === 1) {
        throw new Error(`actual: ${url} expected: WebSocket connection url (should start with "ws" or "http" (if "http" it will auto-replaced to "ws"))`);
    }
    return `ws${parts[1]}`;
};
