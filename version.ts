export const VERSION = "0.1.3";

/** `prepublish` will be invoked before publish, return `false` to prevent the publish */
// deno-lint-ignore require-await
export async function prepublish(version: string) {
  console.log("on prepublish", version);
}

/** `postpublish` will be invoked after published */
// deno-lint-ignore require-await
export async function postpublish(version: string) {
  console.log("on postpublish", version);
}
