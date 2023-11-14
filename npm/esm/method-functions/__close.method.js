export function __close() {
    return new Promise((resolve) => {
        if (this.readyState === this.CLOSED)
            return void resolve(this);
        this.addEventListener("close", () => resolve(this));
    });
}
