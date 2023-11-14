/**
 * @description
 * will not send data if readyState !== OPEN
 */
export declare function send_if_open(this: WebSocket, data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean;
