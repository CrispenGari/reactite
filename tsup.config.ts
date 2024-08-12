import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Adjust this to your entry file(s)
  format: ["cjs", "esm"], // Output formats (CommonJS and ES Modules)
  external: ["react", "react-dom"], // Exclude React and ReactDOM
  sourcemap: true,
  dts: true,
  minify: true,
});
