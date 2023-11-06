/**
 * @description
 * call event listener only first time
 * then remove it
 */
export function once(
  this: WebSocket,
  ...[label, listener, options]: Parameters<WebSocket["addEventListener"]>
): ReturnType<WebSocket["addEventListener"]> {
  const once_listener = (ev: Event) => {
    if (typeof listener === "function") listener(ev);
    else listener.handleEvent(ev);
    this.removeEventListener(label, once_listener, options);
  };
  this.addEventListener(label, once_listener, options);
}
