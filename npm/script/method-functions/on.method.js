"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.on = void 0;
/**
 * @description
 * the same as the `.addEventListener`
 */
function on(...[label, ev, options]) {
    this.addEventListener(label, ev, options);
}
exports.on = on;
