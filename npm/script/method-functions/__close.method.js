"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__close = void 0;
function __close() {
    return new Promise((resolve) => {
        if (this.readyState === this.CLOSED)
            return void resolve(this);
        this.addEventListener("close", () => resolve(this));
    });
}
exports.__close = __close;
