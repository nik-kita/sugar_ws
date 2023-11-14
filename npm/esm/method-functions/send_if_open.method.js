/**
 * @description
 * will not send data if readyState !== OPEN
 */
export function send_if_open(data) {
    if (this.readyState === this.OPEN) {
        this.send(data);
        return true;
    }
    return false;
}
