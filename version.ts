export const VERSION = "0.5.1";

/** `prepublish` will be invoked before publish, return `false` to prevent the publish */
export async function prepublish(version: string): Promise<boolean> {
  const codeTxt = await Deno.readTextFile("mod.ts");

  new Deno
    .Command("deno", {
    args: [
      "run",
      "-A",
      `${Deno.cwd()}/scripts/build_npm.ts`,
      version,
    ],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }).outputSync();

  new Deno
    .Command("npm", {
    args: [
      "publish",
    ],
    cwd: `${Deno.cwd()}/npm`,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  }).outputSync();

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
