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
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
});
