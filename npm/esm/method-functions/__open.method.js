export function __open() {
    return new Promise((resolve) => {
        if (this.readyState === this.OPEN)
            return void resolve(this);
        this.once("open", () => resolve(this));
    });
}
