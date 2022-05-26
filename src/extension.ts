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
            async (deviceId: number) => {
                const git = await getGitAPI();
                console.log("sd");
                const repositories = git?.repositories || [];
                // TODO: should pick correct repo if multiple are open
                const repo = await git?.init(repositories[0].rootUri);

                const cmd_add_to_index = `git status --porcelain | sed -r 's/^.{3}//' | while read line; do git add -N $line; done`;

                const cwd = vscode.workspace.workspaceFolders![0].uri.fsPath;
                console.log(cwd);
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
                                "Failed to create patch",
                                error.message
                            );
                        } else {
                            vscode.window.showInformationMessage(
                                "Patch files created successfully"
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

                console.log("STAGE", diff.staged);
                console.log("UNSTAGE", diff.unstaged);

                const response = await axios.post(
                    "http://localhost:3001/changes",
                    {
                        diff,
                        deviceId,
                    }
                );

                if (response.data.success) {
                    vscode.window.showInformationMessage("Changes saved");
                } else {
                    vscode.window.showErrorMessage(
                        "Error sending and saving message"
                    );
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "codesync.applyChanges",
            async (deviceId: number) => {
                // const git = await getGitAPI();
                // const repositories = git?.repositories || [];
                // TODO: check if multiple repos open
                // const repo = await git?.init(repositories[0].rootUri);

                const currentDir = vscode.workspace.workspaceFolders || [];

                try {
                    const retrievedChanges = await axios.get(
                        "http://localhost:3001/changes",
                        {
                            data: { deviceId },
                        }
                    );
                    const diff = retrievedChanges.data.diff;

                    const stagedPatch = `${currentDir[0].uri.fsPath}/staged.patch`;
                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.file(stagedPatch),
                        Buffer.from(diff.staged)
                    );

                    const unstagedPatch = `${currentDir[0].uri.fsPath}/unstaged.patch`;
                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.file(unstagedPatch),
                        Buffer.from(diff.unstaged)
                    );
                } catch (error) {
                    console.error(error);
                }

                // repo?.apply(patcFilePath);

                // await vscode.workspace.fs.delete(vscode.Uri.file(patcFilePath));

                vscode.window.showInformationMessage("Patch file created");
            }
        )
    );
}
