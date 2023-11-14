import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "nik-kita",
    version: Deno.args[0],
    description: "SugarWs",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/nik-kita/sugar_ws.git",
    },
    bugs: {
      url: "https://github.com/nik-kita/sugar_ws/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
