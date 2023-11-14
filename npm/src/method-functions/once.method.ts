/**
 * @description
 * call event listener only first time
 * then remove it
 * @returns
 * return cb for remove this listener if it is not already called
 */
export function once<K extends keyof WebSocketEventMap>(
  this: WebSocket,
  label: K,
  listener: K extends "close" ? (ev: CloseEvent) => void
    : (ev: WebSocketEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean,
) {
  let called = false;
  const once_listener = (ev: WebSocketEventMap[K]) => {
    called = true;

    // deno-lint-ignore no-explicit-any
    listener(ev as any);

    this.removeEventListener(label, once_listener, options);
  };

  this.addEventListener(label, once_listener, options);

  return () => {
    if (called) return;

    this.removeEventListener(label, once_listener);
  };
}
