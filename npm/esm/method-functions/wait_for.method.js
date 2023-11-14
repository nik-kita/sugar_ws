export function wait_for(state) {
    const result = state === "open" ? this.__open() : this.__close();
    if (state === "open") {
        Object.assign(result, {
            add_add_listeners: (listeners) => {
                listeners.forEach(([cb, label = "message", on_or_once = "on"]) => {
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
