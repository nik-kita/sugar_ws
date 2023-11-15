export function wait_for(state) {
    const result = state === "open" ? this.__open() : this.__close();
    if (state === "open") {
        Object.assign(result, {
            and: (cb) => {
                cb(this);
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
