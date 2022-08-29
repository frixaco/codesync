import * as vscode from "vscode";

export class CodesyncWebviewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "codesync.webview";

	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public setupOAuthCallbackHandler() {
		const webview = this._view?.webview || { postMessage: () => undefined };
		vscode.window.registerUriHandler({
			handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
				if (uri.path === "/callback") {
					const queryParams = new URLSearchParams(uri.query);
					if (queryParams.get("access_token")) {
						const accessToken = queryParams.get("access_token");
						vscode.commands.executeCommand(
							"codesync.saveAccessToken",
							{ accessToken },
						);

						webview.postMessage({
							command: "getAccessToken",
						});
					} else {
						vscode.commands.executeCommand(
							"codesync.saveAccessToken",
							{ accessToken: null },
						);
					}
				}
			},
		});
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		this.setupOAuthCallbackHandler();

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri,
				vscode.Uri.joinPath(this._extensionUri, ".."),
			],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case "send": {
					vscode.commands.executeCommand("codesync.sendChanges", {
						projectId: data.projectId,
					});
					break;
				}
				case "receive": {
					vscode.commands.executeCommand("codesync.applyChanges", {
						projectId: data.projectId,
					});
					break;
				}
				case "saveAccessToken": {
					vscode.commands.executeCommand("codesync.saveAccessToken", {
						accessToken: data.accessToken,
					});
					break;
				}
				default:
					throw new Error("Unknown postMessage type");
					break;
			}
		});
	}

	public show() {
		if (this._view) {
			this._view.show?.(true);
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const mainScriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this._extensionUri,
				"..",
				"ui",
				"dist",
				"index.js",
			),
		);

		const stylesUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this._extensionUri,
				"..",
				"ui",
				"dist",
				"index.css",
			),
		);

		const nonce = getNonce();

		return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
          <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
          <title>Solid App</title>
          <script nonce=${nonce} type="module" crossorigin src="${mainScriptUri}"></script>
          <link rel="stylesheet" href="${stylesUri}">
        </head>
        <body>
          <script nonce="${nonce}">
            const vscodeApi = acquireVsCodeApi();
          </script>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
        </body>
      </html>`;
	}
}

function getNonce() {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
