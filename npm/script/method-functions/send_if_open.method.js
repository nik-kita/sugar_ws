"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_if_open = void 0;
/**
 * @description
 * will not send data if readyState !== OPEN
 */
function send_if_open(data) {
    if (this.readyState === this.OPEN) {
        this.send(data);
        return true;
    }
    return false;
}
exports.send_if_open = send_if_open;
