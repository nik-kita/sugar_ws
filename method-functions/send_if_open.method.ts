/**
 * @description
 * will not send data if readyState !== OPEN
 */
export function send_if_open(
  this: WebSocket,
  data: string | ArrayBufferLike | Blob | ArrayBufferView,
): void {
  if (this.readyState === this.OPEN) this.send(data);
}
