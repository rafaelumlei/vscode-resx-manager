import * as vscode from 'vscode';
import { ResxEditor } from './RESXEditor';

export function activate(context: vscode.ExtensionContext) {
  console.log('')
  context.subscriptions.push(ResxEditor.register(context));
}

export function deactivate() {}
