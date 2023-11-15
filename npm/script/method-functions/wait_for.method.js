"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait_for = void 0;
function wait_for(state) {
    const result = state === "open" ? this.__open() : this.__close();
    if (state === "open") {
        Object.assign(result, {
            and_add_listeners: (cb) => {
                cb(this).forEach(([cb, label = "message", on_or_once = "on"]) => {
                    this[on_or_once](label, cb);
                });
                return result;
            },
        });
    }
    if (state === "close") {
        Object.assign(result, {
            and_close: () => {
                this.close();
                return result;
            },
        });
    }
    return result;
}
exports.wait_for = wait_for;
