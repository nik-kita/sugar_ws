/**
 * @description
 * the same as the `.addEventListener`
 */
export function on(
  this: WebSocket,
  ...[label, ev, options]: Parameters<WebSocket["addEventListener"]>
) {
  this.addEventListener(label, ev, options);
}
