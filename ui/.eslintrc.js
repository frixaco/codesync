/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
    plugins: ["eslint-plugin-solid"],
    extends: ["../.eslintrc.js", "plugin:solid/typescript"],
};
