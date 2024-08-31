import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { typescriptPaths } from "rollup-plugin-typescript-paths";

export default defineConfig({
  build: {
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: [
        path.resolve(__dirname, "src/main.ts"),
        path.resolve(__dirname, "src/web-api-utils/web-api-utils.ts"),
      ],
      fileName: (format, entryName) => {
        return `${entryName}.${format}.js`;
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [],
      plugins: [
        typescriptPaths({
          preserveExtensions: true,
        }),
        typescript({
          sourceMap: false,
          declaration: true,
          outDir: "dist",
        }),
      ],
    },
  },
});
