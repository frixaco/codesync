import * as vscode from "vscode";

export class CodesyncWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "codesync.webview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      console.log("onDidReceiveMessage", data);
      switch (data.type) {
        case "incoming": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`#${data.value}`)
          );
          break;
        }
        case "outcoming": {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`#${data.value}`)
          );
          break;
        }
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
      vscode.Uri.joinPath(this._extensionUri, "solid", "dist", "index.js")
    );
    const vendorScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "solid", "dist", "vendor.js")
    );

    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "solid", "dist", "index.css")
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
          <link nonce=${nonce} rel="modulepreload" href="${vendorScriptUri}">
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
