// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('✅ YAML Ref Navigator activated');

	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider(
			{ language: 'yaml', scheme: 'file' },
			new ReferenceDefinitionProvider()
		)
	);
}



class ReferenceDefinitionProvider implements vscode.DefinitionProvider {
	provideDefinition(document: vscode.TextDocument, position: vscode.Position) {
		const wordRange = document.getWordRangeAtPosition(position, /\$\{?[a-zA-Z0-9_.:]+}?/);
		if (!wordRange) { return; }

		const refText = document.getText(wordRange).replace(/^\$\{?/, '').replace(/}?$/, '');

		// Show a message so we know it ran
		vscode.window.showInformationMessage(`🔍 Looking for definition of "${refText}"`);

		return new vscode.Location(document.uri, new vscode.Position(0, 0));
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
