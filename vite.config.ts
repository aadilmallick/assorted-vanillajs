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
        path.resolve(__dirname, "src/text-animations/text-animations.ts"),
        path.resolve(__dirname, "src/page-loader/page-loader.ts"),
        path.resolve(__dirname, "src/color-logger/color-logger.ts"),
        path.resolve(__dirname, "src/card-gradient/card-gradient.ts"),
        path.resolve(__dirname, "src/border-gradient/border-gradient.ts"),
        path.resolve(__dirname, "src/web-components/web-components.ts"),
        path.resolve(__dirname, "src/toast/Toast.ts"),
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
