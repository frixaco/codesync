import * as vscode from "vscode";
import { GitExtension } from "./git";
import axios from "axios";
import { CodesyncWebviewProvider } from "./webviewProvider";
import * as child_process from "child_process";

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
    vscode.window.showInformationMessage("Codesync has started... Bruh!");

    const provider = new CodesyncWebviewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CodesyncWebviewProvider.viewType,
            provider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "codesync.sendChanges",
            async ({ deviceId, projectId }) => {
                const git = await getGitAPI();
                const repositories = git?.repositories || [];
                // TODO: should pick correct repo if multiple are open
                const repo = await git?.init(repositories[0].rootUri);
                const cmd_add_to_index = `git status --porcelain | sed -r 's/^.{3}//' | while read line; do git add -N $line; done`;
                const cwd = vscode.workspace.workspaceFolders![0].uri.fsPath;

                child_process.exec(
                    cmd_add_to_index,
                    {
                        cwd,
                    },
                    (error, stdout, stderr) => {
                        // TODO: move `| sed -r 's/^.{3}//' | while read line; do git add -N $line; done`
                        // to here, to remove dependency on bash commands
                        if (error) {
                            vscode.window.showErrorMessage(
                                "Failed to add to index.",
                                error.message
                            );
                        }
                    }
                );

                const diff = {
                    unstaged: "",
                    staged: "",
                };
                diff.staged = (await repo?.diff(true)) || "";
                diff.unstaged = (await repo?.diff()) || "";

                const response = await axios.post(
                    "http://localhost:3001/changes",
                    {
                        diff: JSON.stringify(diff),
                        deviceId,
                        projectId,
                    }
                );

                if (response.data.success) {
                    vscode.window.showInformationMessage(
                        "Successfully created diff"
                    );
                } else {
                    vscode.window.showErrorMessage("Error, try again");
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "codesync.applyChanges",
            async ({ deviceId, projectId }) => {
                const git = await getGitAPI();
                const repositories = git?.repositories || [];
                // TODO: should pick correct repo if multiple are open
                const repo = await git?.init(repositories[0].rootUri);

                const currentDir = vscode.workspace.workspaceFolders || [];
                const stagedPatch = `${currentDir[0].uri.fsPath}/staged.patch`;
                const unstagedPatch = `${currentDir[0].uri.fsPath}/unstaged.patch`;

                try {
                    const retrievedChanges = await axios.post(
                        "http://localhost:3001/change",
                        {
                            deviceId,
                            projectId,
                        }
                    );
                    if (!retrievedChanges.data.success) {
                        throw new Error();
                    }

                    const diff = JSON.parse(retrievedChanges.data.diff);

                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.file(stagedPatch),
                        Buffer.from(diff.staged)
                    );

                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.file(unstagedPatch),
                        Buffer.from(diff.unstaged)
                    );

                    await repo?.apply(stagedPatch);

                    const cmd_stage = `git add -A && git reset -- *.patch`;
                    const cwd =
                        vscode.workspace.workspaceFolders![0].uri.fsPath;

                    child_process.exec(
                        cmd_stage,
                        {
                            cwd,
                        },
                        (error, stdout, stderr) => {
                            // TODO: move `| sed -r 's/^.{3}//' | while read line; do git add -N $line; done`
                            // to here, to remove dependency on bash commands
                            if (error) {
                                vscode.window.showErrorMessage(
                                    "Failed to staged.",
                                    error.message
                                );
                            }
                        }
                    );

                    await repo?.apply(unstagedPatch);

                    await vscode.workspace.fs.delete(
                        vscode.Uri.file(stagedPatch)
                    );
                    await vscode.workspace.fs.delete(
                        vscode.Uri.file(unstagedPatch)
                    );

                    vscode.window.showInformationMessage(
                        "Success. Patch file created and applied"
                    );
                } catch (error) {
                    vscode.window.showErrorMessage("Error, try again");
                }
            }
        )
    );
}
