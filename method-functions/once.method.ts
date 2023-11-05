/**
 * @description
 * call event listener only first time
 * then remove it
 */
export function once(
  this: WebSocket,
  ...[label, ev, options]: Parameters<WebSocket["addEventListener"]>
): ReturnType<WebSocket["addEventListener"]> {
  const once_ev = (_ev: Event) => {
    if (typeof ev === "function") ev(_ev);
    else ev.handleEvent(_ev);
    (this as WebSocket).removeEventListener(label, once_ev, options);
  };
  this.addEventListener(label, once_ev, options);
}
