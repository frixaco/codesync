import presetUno from "@unocss/preset-uno";
import Unocss from "unocss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

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
	server: {
		port: 3000,
	},
	build: {
		outDir: "../extension/ui",
		target: "esnext",
		rollupOptions: {
			output: {
				chunkFileNames: "[name].js",
				assetFileNames: "[name][extname]",
				entryFileNames: "[name].js",
			},
		},
	},
});
