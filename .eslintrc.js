/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
	env: {
		browser: true,
		node: true,
	},
	root: true,
	ignorePatterns: ["node_modules", "dist", "build", "out"],
	overrides: [
		{
			files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			extends: [
				"eslint:recommended",
				"plugin:@typescript-eslint/eslint-recommended",
				"plugin:@typescript-eslint/recommended",
				"prettier",
			],
			rules: {
				"@typescript-eslint/no-unused-vars": [
					"error",
					{
						args: "none",
						argsIgnorePattern: "^_",
						varsIgnorePattern: "^_",
					},
				],
			},
		},
	],
};
