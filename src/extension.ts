// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';  // npm install yaml

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

async function findYamlDefinition(refText: string): Promise<vscode.Location[]> {
	const results: vscode.Location[] = [];

	// 1. Search open documents (even untitled or outside workspace)
	for (const doc of vscode.workspace.textDocuments) {
		if (!doc.fileName.endsWith('.yaml') && !doc.fileName.endsWith('.yml')) { continue; }

		const lines = doc.getText().split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmed = line.trimStart();

			if (trimmed.startsWith(`${refText}:`)) {
				const position = new vscode.Position(i, line.indexOf(refText));
				results.push(new vscode.Location(doc.uri, position));
			}
		}
	}

	// Search workspace
	const files = await vscode.workspace.findFiles('**/*.y?(a)ml');

	for (const file of files) {
		const content = fs.readFileSync(file.fsPath, 'utf-8');
		const lines = content.split('\n');

		// Walk through keys and match ref
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].trimStart().startsWith(`${refText}:`)) {
				const position = new vscode.Position(i, lines[i].indexOf(refText));
				results.push(new vscode.Location(file, position));
			}
		}
	}

	return results;
}


class ReferenceDefinitionProvider implements vscode.DefinitionProvider {
	async provideDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
	): Promise<vscode.Definition | null> {
		const wordRange = document.getWordRangeAtPosition(position, /\$\{[a-zA-Z0-9_.:]+\}/);
		if (!wordRange) { return null; }
		// finds ${foo.bar} and such

		const match = document.getText(wordRange).match(/^\$\{([a-zA-Z0-9_.:]+)\}$/);
		if (!match) { return null; }

		const refText = match[1];        // first sub-match, i.e. foo.bar

		// Show a message so we know it ran
		vscode.window.showInformationMessage(`🔍 Looking for definition of "${refText}"`);

		// return new vscode.Location(document.uri, new vscode.Position(0, 0));
		const locations = await findYamlDefinition(refText);
		return locations.length ? locations : null;
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
