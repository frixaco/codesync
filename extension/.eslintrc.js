/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
	extends: ["../.eslintrc.js"],
	ignorePatterns: ["dist", "out", "build", "ui"],
};
