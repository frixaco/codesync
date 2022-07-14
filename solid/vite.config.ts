import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";
import presetUno from "@unocss/preset-uno";

export default defineConfig({
    plugins: [
        solidPlugin(),
        Unocss({
            presets: [presetUno()],
            theme: {
                colors: {
                    vsblue: "#0066b8",
                    vsgreen: "#008000",
                },
            },
        }),
    ],
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
