export const VERSION = "0.3.2";

/** `prepublish` will be invoked before publish, return `false` to prevent the publish */
export async function prepublish(version: string): Promise<boolean> {
  const codeTxt = await Deno.readTextFile("mod.ts");

  await new Deno.Command(`deno run -A scripts/build_npm.ts ${VERSION}`);
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
