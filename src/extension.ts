import * as vscode from "vscode";
import { GitExtension } from "./git";
import axios from "axios";
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

// let diff: {
// 	staged: Change[] | undefined;
// 	unstaged: Change[] | undefined;
// } = { staged: undefined, unstaged: undefined };

let diff: string = "";

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
    vscode.commands.registerCommand("codesync.sendChanges", async () => {
      // const git = await getGitAPI();
      // const repositories = git?.repositories || [];
      // // TODO: check if multiple repos open
      // const repo = await git?.init(repositories[0].rootUri);

      // // const staged = repo?.state.indexChanges || [];
      // // const unstaged = repo?.state.workingTreeChanges || [];
      // // const paths = [
      // // 	...staged?.map((s) => s.uri.toString().replace("file://", "")),
      // // 	...unstaged?.map((u) => u.uri.toString().replace("file://", "")),
      // // ];
      // // const repoPath = repo?.rootUri.fsPath || "";

      // try {
      // 	await repo?.add([]);
      // } catch (e) {
      // 	console.error(e);
      // }

      // diff = (await repo?.diff(true)) || "";

      // const response = await axios.post("http://localhost:3000", {
      // 	diff: diff,
      // });
      // console.log("response", response.data);

      await vscode.commands.executeCommand(
        "workbench.view.extension.codesync-sidepanel-view"
      );
      // provider.show();

      vscode.window.showInformationMessage(
        `finished`
        // `${
        //   repositories.length && diff.length
        //     ? "Changes saved'"
        //     : "No repo or changes detected"
        // }`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codesync.applyChanges", async () => {
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
    })
  );
}

export function deactivate() {}
