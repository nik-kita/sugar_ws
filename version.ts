export const VERSION = "0.2.1";

/** `prepublish` will be invoked before publish, return `false` to prevent the publish */
export async function prepublish(version: string): Promise<boolean> {
  const codeTxt = await Deno.readTextFile("mod.ts");
  await Deno.writeTextFile(
    "source-code.md",
    `${"```ts\n// version:"}${version}\n${codeTxt}${"```\n"}`,
  );

  return true;
}

/** `postpublish` will be invoked after published */
// deno-lint-ignore require-await
export async function postpublish(version: string) {
  console.log("on postpublish", version);
}
