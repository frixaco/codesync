/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
    env: {
        node: true,
    },
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            // { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "no-console": ["warn"],
    },
};
module.exports = config;
