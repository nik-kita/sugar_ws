"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = void 0;
/**
 * @description
 * call event listener only first time
 * then remove it
 * @returns
 * return cb for remove this listener if it is not already called
 */
function once(label, listener, options) {
    let called = false;
    const once_listener = (ev) => {
        called = true;
        // deno-lint-ignore no-explicit-any
        listener(ev);
        this.removeEventListener(label, once_listener, options);
    };
    this.addEventListener(label, once_listener, options);
    return () => {
        if (called)
            return;
        this.removeEventListener(label, once_listener);
    };
}
exports.once = once;
