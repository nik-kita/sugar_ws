/**
 * @description
 * will not send data if readyState !== OPEN
 */
export function send_if_open(
  this: WebSocket,
  data: string | ArrayBufferLike | Blob | ArrayBufferView,
): boolean {
  if (this.readyState === this.OPEN) {
    this.send(data);

    return true;
  }

  return false;
}
