/**
 * @description
 * call event listener only first time
 * then remove it
 * @returns
 * return cb for remove this listener if it is not already called
 */
export function once(label, listener, options) {
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
