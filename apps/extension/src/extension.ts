// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { GitExtension } from "./git";
import axios from "axios";

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

// let diff: {
// 	staged: Change[] | undefined;
// 	unstaged: Change[] | undefined;
// } = { staged: undefined, unstaged: undefined };

let diff: string = "";

export async function activate(context: vscode.ExtensionContext) {
	console.log("Codesync started");

	let disposable1 = vscode.commands.registerCommand(
		"codesync.getChanges",
		async () => {
			const git = await getGitAPI();
			const repositories = git?.repositories || [];
			// TODO: check if multiple repos open
			const repo = await git?.init(repositories[0].rootUri);

			// const staged = repo?.state.indexChanges || [];
			// const unstaged = repo?.state.workingTreeChanges || [];
			// const paths = [
			// 	...staged?.map((s) => s.uri.toString().replace("file://", "")),
			// 	...unstaged?.map((u) => u.uri.toString().replace("file://", "")),
			// ];
			// const repoPath = repo?.rootUri.fsPath || "";

			try {
				await repo?.add([]);
			} catch (e) {
				console.error(e);
			}

			diff = (await repo?.diff(true)) || "";

			const response = await axios.post("http://localhost:3000", {
				diff: diff,
			});
			console.log("response", response.data);

			vscode.window.showInformationMessage(
				`${
					repositories.length && diff.length
						? "Changes saved'"
						: "No repo or changes detected"
				}`
			);
		}
	);

	context.subscriptions.push(disposable1);

	let disposable2 = vscode.commands.registerCommand(
		"codesync.retrieveChanges",
		async () => {
			const git = await getGitAPI();
			const repositories = git?.repositories || [];
			// TODO: check if multiple repos open
			const repo = await git?.init(repositories[0].rootUri);

			const currentDir = vscode.workspace.workspaceFolders || [];
			const patcFilePath = `${currentDir[0].uri.fsPath}/temp.patch`;

			try {
				const retrievedChanges = await axios.get("http://localhost:3000");
				const diff = retrievedChanges.data.diff;

				await vscode.workspace.fs.writeFile(
					vscode.Uri.file(patcFilePath),
					Buffer.from(diff)
				);
			} catch (error) {
				console.error(error);
			}

			repo?.apply(patcFilePath);

			await vscode.workspace.fs.delete(vscode.Uri.file(patcFilePath));

			vscode.window.showInformationMessage("Changes are applied");
		}
	);

	context.subscriptions.push(disposable2);
}

export function deactivate() {}
