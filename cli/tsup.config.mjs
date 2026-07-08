import { defineConfig } from "tsup";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  shims: true,
  esbuildOptions(options) {
    options.alias = {
      "@": path.resolve(__dirname, "../src"),
    };
  },
});
