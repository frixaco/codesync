import * as child_process from "child_process";
import got from "got";
import * as vscode from "vscode";
import type { GitExtension } from "./git";
import { CodesyncWebviewProvider } from "./webviewProvider";

async function getGitAPI() {
	try {
		const extension =
			vscode.extensions.getExtension<GitExtension>("vscode.git");
		if (extension == null) return undefined;
		const gitExtension = extension.isActive
			? extension.exports
			: await extension.activate();
		return gitExtension?.getAPI(1);
	} catch {
		return undefined;
	}
}

export async function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("Codesync has started");

	const provider = new CodesyncWebviewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			CodesyncWebviewProvider.viewType,
			provider,
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"codesync.sendChanges",
			async ({ projectId }) => {
				const git = await getGitAPI();
				const repositories = git?.repositories || [];
				// TODO: should pick correct repo if multiple are open
				if (!repositories || !repositories[0]) {
					vscode.window.showErrorMessage(
						"Failed to detect repository.",
					);
					return;
				}

				if (
					!vscode.workspace.workspaceFolders ||
					!vscode.workspace.workspaceFolders[0]
				) {
					vscode.window.showErrorMessage(
						"Failed to detect workspace folder.",
					);
					return;
				}

				const repo = await git?.init(repositories[0].rootUri);
				const cmd_add_to_index = `git status --porcelain | sed -r 's/^.{3}//' | while read line; do git add -N $line; done`;
				const cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;

				child_process.exec(
					cmd_add_to_index,
					{
						cwd,
					},
					(error, _stdout, _stderr) => {
						// TODO: move `| sed -r 's/^.{3}//' | while read line; do git add -N $line; done`
						// to here, to remove dependency on bash commands
						if (error) {
							vscode.window.showErrorMessage(
								"Failed to add to index.",
								error.message,
							);
						}
					},
				);

				const diff = {
					unstaged: "",
					staged: "",
				};
				diff.staged = (await repo?.diff(true)) || "";
				diff.unstaged = (await repo?.diff()) || "";

				const { data: response } = await got
					.post("http://localhost:4000/change", {
						body: JSON.stringify({
							diff: JSON.stringify(diff),
							projectId,
						}),
					})
					.json();

				if (response.data.success) {
					vscode.window.showInformationMessage(
						"Successfully created diff",
					);
				} else {
					vscode.window.showErrorMessage("Error, try again");
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"codesync.applyChanges",
			async ({ projectId }) => {
				const git = await getGitAPI();
				const repositories = git?.repositories || [];
				// TODO: should pick correct repo if multiple are open
				if (!repositories || !repositories[0]) {
					vscode.window.showErrorMessage(
						"Failed to detect repository.",
					);
					return;
				}

				const repo = await git?.init(repositories[0].rootUri);

				const currentDir = vscode.workspace.workspaceFolders;
				if (!currentDir || !currentDir[0]) {
					vscode.window.showErrorMessage(
						"Failed to detect workspace folder.",
					);
					return;
				}
				const stagedPatch = `${currentDir[0].uri.fsPath}/staged.patch`;
				const unstagedPatch = `${currentDir[0].uri.fsPath}/unstaged.patch`;

				try {
					const { data: retrievedChanges } = await got
						.get(
							"http://localhost:4000/change" +
								new URLSearchParams({
									projectId,
								}),
							{
								headers: {
									authorization:
										context.workspaceState.get<string>(
											"codesync.accessToken",
										),
								},
							},
						)
						.json();
					if (!retrievedChanges.data.success) {
						throw new Error();
					}

					const diff = JSON.parse(retrievedChanges.data.diff);

					await vscode.workspace.fs.writeFile(
						vscode.Uri.file(stagedPatch),
						Buffer.from(diff.staged),
					);

					await vscode.workspace.fs.writeFile(
						vscode.Uri.file(unstagedPatch),
						Buffer.from(diff.unstaged),
					);

					await repo?.apply(stagedPatch);

					const cmd_stage = `git add -A && git reset -- *.patch`;
					const cwd = currentDir[0].uri.fsPath;

					child_process.exec(
						cmd_stage,
						{
							cwd,
						},
						(error, _stdout, _stderr) => {
							// TODO: move `| sed -r 's/^.{3}//' | while read line; do git add -N $line; done`
							// to here, to remove dependency on bash commands
							if (error) {
								vscode.window.showErrorMessage(
									"Failed to staged.",
									error.message,
								);
							}
						},
					);

					await repo?.apply(unstagedPatch);

					await vscode.workspace.fs.delete(
						vscode.Uri.file(stagedPatch),
					);
					await vscode.workspace.fs.delete(
						vscode.Uri.file(unstagedPatch),
					);

					vscode.window.showInformationMessage(
						"Success. Patch file created and applied",
					);
				} catch (error) {
					vscode.window.showErrorMessage("Error, try again");
				}
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"codesync.persistAuth",
			async ({ accessToken, refreshToken }) => {
				await context.workspaceState.update(
					"codesync.accessToken",
					accessToken,
				);
				await context.workspaceState.update(
					"codesync.refreshToken",
					refreshToken,
				);
			},
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"codesync.refreshAuth",
			async ({ updateWebview }) => {
				const _accessToken = context.workspaceState.get<string>(
					"codesync.accessToken",
				);
				console.log("workspace keys", context.workspaceState.keys());

				const refreshToken = context.workspaceState.get<string>(
					"codesync.refreshToken",
				);

				if (!refreshToken) {
					updateWebview({
						accessToken: "",
						refreshToken: "",
						isAuth: false,
					});
					return;
				}

				const tokens = await got
					.get("http://localhost:4000/login/oauth/github/refresh", {
						headers: {
							authorization: refreshToken,
						},
					})
					.json<{
						success: boolean;
						accessToken: string;
						refreshToken: string;
					}>();

				vscode.commands.executeCommand("codesync.persistAuth", {
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
				});

				if (tokens.success) {
					updateWebview({
						accessToken: tokens.accessToken,
						refreshToken: tokens.refreshToken,
						isAuth: true,
					});
					return;
				}

				updateWebview({
					accessToken: "",
					refreshToken: "",
					isAuth: false,
				});
			},
		),
	);
}
