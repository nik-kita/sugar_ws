"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__open = void 0;
function __open() {
    return new Promise((resolve) => {
        if (this.readyState === this.OPEN)
            return void resolve(this);
        this.once("open", () => resolve(this));
    });
}
exports.__open = __open;
