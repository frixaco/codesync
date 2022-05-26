import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
    plugins: [solidPlugin()],
    build: {
        target: "esnext",
        polyfillDynamicImport: false,
        rollupOptions: {
            output: {
                chunkFileNames: "[name].js",
                assetFileNames: "[name][extname]",
                entryFileNames: "[name].js",
            },
        },
    },
});
