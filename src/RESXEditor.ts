import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

type Resources = { [lang: string]: string };

export class ResxEditor implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new ResxEditor(context);
    return vscode.window.registerCustomEditorProvider("resxEditor", provider);
  }

  constructor(private readonly context: vscode.ExtensionContext) { }

  async resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true };

    const scriptUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, "out", "webview.js"))
    );

    const resources: Resources = await this.loadResxFiles(document);

    webviewPanel.webview.html = this.getHtml(scriptUri, resources, webviewPanel.webview);

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "update") {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), message.data);
        await vscode.workspace.applyEdit(edit);
        await document.save();
      }
    });
  }

  private async loadResxFiles(document: vscode.TextDocument) {
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    const resourceFile = path.parse(document.fileName).base.replace(/\..*$/, '');
    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder!.uri, `{${resourceFile}.resx,${resourceFile}.*.resx}`));
    const regex = /^(.*)\.(\w+)\.resx$/;
    const resources: Resources = {};
    files.forEach(async (f) => {
      const filename = path.parse(f.fsPath).base;
      const match = filename.match(regex);
      resources[match ? match[2] : 'default'] = (await vscode.workspace.openTextDocument(f)).getText();
    });
    return resources;
  }

  private getNonce() {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private getHtml(scriptUri: vscode.Uri, resources: Resources, webview: vscode.Webview): string {
    const nonce = this.getNonce();
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; style-src ${webview.cspSource}; 
            img-src ${webview.cspSource} https:; 
            script-src ${webview.cspSource} 'unsafe-inline';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>Rafael ${scriptUri}</h1>
        <div id="root"></div>
        <script>
          window.initialData = ${JSON.stringify(resources)};
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}