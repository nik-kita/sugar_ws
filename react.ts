import type {
  useEffect as preact_useEffect,
  useRef as preact_useRef,
  useState as preact_useState,
} from "preact/hooks";
// @deno-types="npm:@types/react"
import {
  useEffect as react_useEffect,
  useRef as react_useRef,
  useState as react_useState,
} from "react";
import { SugarWs } from "./mod.ts";

const {
  CLOSING,
  CLOSED,
} = WebSocket;

export function genUseWs({
  useEffect,
  useRef,
  useState,
}: {
  useEffect: typeof preact_useEffect;
  useRef: typeof preact_useRef;
  useState: typeof preact_useState;
} | {
  useEffect: typeof react_useEffect;
  useRef: typeof react_useRef;
  useState: typeof react_useState;
}) {
  return function useWs(url: string) {
    const x = useRef({
      ws: null as null | SugarWs,
      listeners: new Map<string, {
        on_or_once: "on" | "once";
        label: keyof WebSocketEventMap;
        listener: EvL;
        options?: boolean | AddEventListenerOptions;
        rm_once?: () => void;
      }>(),
    });
    const [
      on_or_off,
      set_or_on_off,
    ] = useState<"on" | "off">("off");
    const [
      is_online,
      set_is_online,
    ] = useState(false);
    const [
      check_needed,
      make_check,
    ] = useState(true);

    useEffect(() => {
      const { ws } = x.current;

      if (on_or_off === "on") {
        if (
          !ws ||
          (ws && (ws.readyState === CLOSING || ws.readyState === CLOSED))
        ) {
          const prev = x.current.ws;

          x.current.ws = new SugarWs(http_to_ws(url));
          x.current.ws.wait_for("open").then(() => set_is_online(true));
          x.current.listeners.forEach((l) => {
            const {
              label,
              listener,
              on_or_once,
              options,
            } = l;
            const rm_once_or_void = x.current.ws![on_or_once](
              label,
              listener as EventListener,
              options,
            );

            if (on_or_once === "once") {
              l.rm_once = rm_once_or_void as () => void;
            }
          });

          x.current.ws.once("close", () => {
            set_is_online(false);
            x.current.ws = null;
            make_check((prev) => !prev);
          });

          prev?.close();
        }
      } else {
        if (
          ws && (ws.readyState !== CLOSING || ws.readyState as 3 !== CLOSED)
        ) {
          ws.close();
        }
      }

      return () => {
        if (
          ws && (ws.readyState !== CLOSING || ws.readyState as 3 !== CLOSED)
        ) {
          ws.close();
        }
      };
    }, [on_or_off, check_needed]);

    return {
      is_online,
      turn: set_or_on_off,
      send(message: string) {
        if (x.current.ws) {
          x.current.ws.send_if_open(message);
        }
      },
      on(...[label, listener, options]: Parameters<SugarWs["once"]>) {
        const key = `on::${label}::${listener.toString()}`;

        if (x.current.listeners.has(key)) return key;

        x.current.listeners.set(key, {
          label,
          listener,
          on_or_once: "on",
          options,
        });

        if (x.current.ws) {
          x.current.ws.on(label, listener as EventListener, options);
        }

        return key;
      },
      once(...[label, listener, options]: Parameters<SugarWs["once"]>) {
        const key = `once::${label}::${listener.toString()}`;

        if (x.current.listeners.has(key)) return key;

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
      rm(key: string) {
        const rm_target = x.current.listeners.get(key);

        if (!rm_target) return false;

        x.current.listeners.delete(key);

        if (x.current.ws) {
          if (rm_target.rm_once) {
            rm_target.rm_once();
          } else {
            x.current.ws.removeEventListener(
              rm_target.label,
              rm_target.listener as EventListenerOrEventListenerObject,
            );
          }
        }

        return true;
      },
    };
  };
}

type EvL = Parameters<SugarWs["once"]>[1];

const http_to_ws = (url: string) => {
  if (url.substring(0, 2) === "ws") return url;

  const parts = url.split("http");

  if (parts.length === 1) {
    throw new Error(
      `actual: ${url} expected: WebSocket connection url (should start with "ws" or "http" (if "http" it will auto-replaced to "ws"))`,
    );
  }

  return `ws${parts[1]}`;
};
