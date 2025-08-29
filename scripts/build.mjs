/* ===================== scripts/build.mjs ===================== */
import { build } from "esbuild";

const common = {
  entryPoints: ["src/index.js"],
  platform: "node",
  bundle: true,
  sourcemap: false,
  target: ["node18"],
  external: [],
};

await build({ ...common, format: "esm", outfile: "dist/index.mjs" });
await build({ ...common, format: "cjs", outfile: "dist/index.cjs" });

console.log("✔ build ok: dist/index.mjs + dist/index.cjs");
