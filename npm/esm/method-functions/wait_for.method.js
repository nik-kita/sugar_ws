export function wait_for(state) {
    const result = state === "open" ? this.__open() : this.__close();
    if (state === "open") {
        Object.assign(result, {
            and_add_listeners_for: (obj) => {
                Object.entries(obj).forEach(([label, cb]) => {
                    if (label === "first_message") {
                        // deno-lint-ignore no-explicit-any
                        this.once("message", cb);
                        return;
                    }
                    // deno-lint-ignore no-explicit-any
                    this.on(label, cb);
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
