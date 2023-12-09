import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts", "./react.ts"],
  outDir: "./npm",
  declaration: "separate",
  test: false,
  compilerOptions: {
    lib: ["DOM"],
    target: "ES2020",
  },
  shims: {
    deno: true,
  },
  package: {
    author: "nik-kita",
    name: "sugar_ws",
    version: Deno.args[0],
    description:
      "Wrapper around browser's WebSocket for more simple and strict control of readyStates.",
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
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
