/**
 * @description
 * the same as the `.addEventListener`
 */
export function on(...[label, ev, options]) {
    this.addEventListener(label, ev, options);
}
