/**
 * @description
 * call event listener only first time
 * then remove it
 * @returns
 * return cb for remove this listener if it is not already called
 */
export declare function once<K extends keyof WebSocketEventMap>(this: WebSocket, label: K, listener: K extends "close" ? (ev: CloseEvent) => void : (ev: WebSocketEventMap[K]) => void, options?: AddEventListenerOptions | boolean): () => void;
